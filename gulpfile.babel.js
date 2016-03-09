'use strict';
import _ from 'lodash';
import del from 'del';
import gulp from 'gulp';
import path from 'path';
import gulpLoadPlugins from 'gulp-load-plugins';
import http from 'http';
import open from 'open';
import lazypipe from 'lazypipe';
import {stream as wiredep} from 'wiredep';
import nodemon from 'nodemon';
import runSequence from 'run-sequence';

var plugins = gulpLoadPlugins();
var config;

const clientPath = require('./bower.json').appPath || 'client';
const serverPath = 'server';
const paths = {
    client: {
        assets: `${clientPath}/assets/**/*`,
        images: `${clientPath}/assets/images/**/*`,
        scripts: [
            `${clientPath}/**/!(*.spec|*.mock).js`,
            `!${clientPath}/bower_components/**/*`,
            `!${clientPath}/typings/**/*`
        ],
        styles: [`${clientPath}/{app,components}/**/*.scss`],
        mainStyle: `${clientPath}/app/app.scss`,
        views: `${clientPath}/{app,components}/**/*.html`,
        mainView: `${clientPath}/index.html`,
        test: [`${clientPath}/{app,components}/**/*.{spec,mock}.js`],
        e2e: ['e2e/**/*.spec.js'],
        bower: `${clientPath}/bower_components/`
    },
    server: {
        scripts: [`${serverPath}/**/!(*.spec|*.integration).js`],
        json: [`${serverPath}/**/*.json`],
        test: {
          integration: [`${serverPath}/**/*.integration.js`, 'mocha.global.js'],
          unit: [`${serverPath}/**/*.spec.js`, 'mocha.global.js']
        }
    },
    karma: 'karma.conf.js',
    dist: 'dist'
};

/********************
 * Helper functions
 ********************/
function sortModulesFirst(a, b) {
    var module = /\.module\.js$/;
    var aMod = module.test(a.path);
    var bMod = module.test(b.path);
    // inject *.module.js first
    if (aMod === bMod) {
        // either both modules or both non-modules, so just sort normally
        if (a.path < b.path) {
            return -1;
        }
        if (a.path > b.path) {
            return 1;
        }
        return 0;
    } else {
        return (aMod ? -1 : 1);
    }
}

// Call page until first success
function whenServerReady(cb) {
    var serverReady = false;
    var appReadyInterval = setInterval(() =>
        checkAppReady((ready) => {
            if (!ready || serverReady) {
                return;
            }
            clearInterval(appReadyInterval);
            serverReady = true;
            cb();
        }),
        100);
}

function checkAppReady(cb) {
    var options = {
        host: 'localhost',
        port: config.port
    };
    http
        .get(options, () => cb(true))
        .on('error', () => cb(false));
}

function onServerLog(log) {
    console.log(plugins.util.colors.white('[') +
        plugins.util.colors.yellow('nodemon') +
        plugins.util.colors.white('] ') +
        log.message);
}

/********************
 * Reusable pipelines
 ********************/
let lintClientScripts = lazypipe()
    .pipe(plugins.jshint, `${clientPath}/.jshintrc`)
    .pipe(plugins.jshint.reporter, 'jshint-stylish');

let lintServerScripts = lazypipe()
    .pipe(plugins.jshint, `${serverPath}/.jshintrc`)
    .pipe(plugins.jshint.reporter, 'jshint-stylish');

let styles = lazypipe()
    .pipe(plugins.sourcemaps.init)
    .pipe(plugins.sass)
    .pipe(plugins.autoprefixer, {browsers: ['last 1 version']})
    .pipe(plugins.sourcemaps.write, '.');

let transpileClient = lazypipe()
    .pipe(plugins.sourcemaps.init)
    .pipe(plugins.babel)
    .pipe(plugins.sourcemaps.write, '.');

let transpileServer = lazypipe()
    .pipe(plugins.sourcemaps.init)
    .pipe(plugins.babel)
    .pipe(plugins.sourcemaps.write, '.');
/********************
 * Tasks
 ********************/

gulp.task('clean:tmp', () => del(['.tmp/**/*'], {dot: true}));

gulp.task('constant', function() {
  let sharedConfig = require(`./${serverPath}/config/environment/shared`);
  return plugins.ngConstant({
    name: 'faster.constants',
    deps: [],
    wrap: true,
    stream: true,
    constants: { appConfig: sharedConfig }
  })
    .pipe(plugins.rename({
      basename: 'app.constant'
    }))
    .pipe(gulp.dest(`${clientPath}/app/`))
});

gulp.task('lint:scripts', cb => runSequence(['lint:scripts:client', 'lint:scripts:server'], cb));
    gulp.task('lint:scripts:client', () => {
        return gulp.src(_.union(
            paths.client.scripts,
            _.map(paths.client.test, blob => '!' + blob),
            [`${clientPath}/app/app.constant.js`]
        ))
            .pipe(lintClientScripts());
    });
    gulp.task('lint:scripts:server', () => {
        return gulp.src(_.union(paths.server.scripts, _.map(paths.server.test, blob => '!' + blob)))
            .pipe(lintServerScripts());
    });

gulp.task('inject', cb => {
    runSequence(['inject:js', 'inject:css', 'inject:scss'], cb);
});
    gulp.task('inject:js', () => {
        return gulp.src(paths.client.mainView)
            .pipe(plugins.inject(
                gulp.src(_.union(paths.client.scripts, [`!${clientPath}/**/*.{spec,mock}.js`, `!${clientPath}/app/app.js`]), {read: false})
                    .pipe(plugins.sort(sortModulesFirst)),
                {
                    starttag: '<!-- injector:js -->',
                    endtag: '<!-- endinjector -->',
                    transform: (filepath) => '<script src="' + filepath.replace(`/${clientPath}/`, '') + '"></script>'
                }))
            .pipe(gulp.dest(clientPath));
    });
    gulp.task('inject:css', () => {
        return gulp.src(paths.client.mainView)
            .pipe(plugins.inject(
                gulp.src(`/${clientPath}/{app,components}/**/*.css`, {read: false})
                    .pipe(plugins.sort()),
                {
                    starttag: '<!-- injector:css -->',
                    endtag: '<!-- endinjector -->',
                    transform: (filepath) => '<link rel="stylesheet" href="' + filepath.replace(`/${clientPath}/`, '').replace('/.tmp/', '') + '">'
                }))
            .pipe(gulp.dest(clientPath));
    });
    gulp.task('inject:scss', () => {
        return gulp.src(paths.client.mainStyle)
            .pipe(plugins.inject(
                gulp.src(_.union(paths.client.styles, ['!' + paths.client.mainStyle]), {read: false})
                    .pipe(plugins.sort()),
                {
                    starttag: '// injector',
                    endtag: '// endinjector',
                    transform: (filepath) => {
                        let newPath = filepath
                            .replace(`/${clientPath}/app/`, '')
                            .replace(`/${clientPath}/components/`, '../components/')
                            .replace(/_(.*).scss/, (match, p1, offset, string) => p1)
                            .replace('.scss', '');
                        return `@import '${newPath}';`;
                    }
                }))
            .pipe(gulp.dest(`${clientPath}/app`));
    });

// inject bower components
gulp.task('wiredep:client', () => {
    return gulp.src(paths.client.mainView)
        .pipe(wiredep({
            exclude: [
                /bootstrap-sass-official/,
                /bootstrap.js/,
                /json3/,
                /es5-shim/,
                /bootstrap.css/,
                /font-awesome.css/
            ],
            ignorePath: clientPath
        }))
        .pipe(gulp.dest(`${clientPath}/`));
});

gulp.task('transpile:client', () => {
    return gulp.src(paths.client.scripts)
        .pipe(transpileClient())
        .pipe(gulp.dest('.tmp'));
});

gulp.task('transpile:server', () => {
    return gulp.src(_.union(paths.server.scripts, paths.server.json))
        .pipe(transpileServer())
        .pipe(gulp.dest(`${paths.dist}/${serverPath}`));
});

gulp.task('styles', () => {
    return gulp.src(paths.client.mainStyle)
        .pipe(styles())
        .pipe(gulp.dest('.tmp/app'));
});

gulp.task('start:server', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    config = require(`./${serverPath}/config/environment`);
    nodemon(`-w ${serverPath} ${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('start:client', cb => {
    whenServerReady(() => {
        open('http://localhost:' + config.port);
        cb();
    });
});

gulp.task('clean:dist', () => del([`${paths.dist}/!(.git*|.openshift|Procfile)**`], {dot: true}));

gulp.task('build:images', () => {
    return gulp.src(paths.client.images)
        .pipe(plugins.imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(plugins.rev())
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets/images`))
        .pipe(plugins.rev.manifest(`${paths.dist}/${clientPath}/assets/rev-manifest.json`, {
            base: `${paths.dist}/${clientPath}/assets`,
            merge: true
        }))
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets`));
});

gulp.task('copy:extras', () => {
    return gulp.src([
        `${clientPath}/favicon.ico`,
        `${clientPath}/robots.txt`,
        `${clientPath}/.htaccess`
    ], { dot: true })
        .pipe(gulp.dest(`${paths.dist}/${clientPath}`));
});

gulp.task('copy:assets', () => {
    return gulp.src([paths.client.assets, '!' + paths.client.images])
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets`));
});

gulp.task('copy:server', () => {
    return gulp.src([
        'package.json',
        'bower.json',
        '.bowerrc'
    ], {cwdbase: true})
        .pipe(gulp.dest(paths.dist));
});

gulp.task('html', function() {
    return gulp.src(`${clientPath}/{app,components}/**/*.html`)
        .pipe(plugins.angularTemplatecache({
            module: 'faster'
        }))
        .pipe(gulp.dest('.tmp'));
});

gulp.task('watch', () => {
    var testFiles = _.union(paths.client.test, paths.server.test.unit, paths.server.test.integration);

    plugins.livereload.listen();

    plugins.watch(paths.client.styles, () => {  //['inject:scss']
        gulp.src(paths.client.mainStyle)
            .pipe(plugins.plumber())
            .pipe(styles())
            .pipe(gulp.dest('.tmp/app'))
            .pipe(plugins.livereload());
    });

    plugins.watch(paths.client.views)
        .pipe(plugins.plumber())
        .pipe(plugins.livereload());

    plugins.watch(paths.client.scripts) //['inject:js']
        .pipe(plugins.plumber())
        .pipe(transpileClient())
        .pipe(gulp.dest('.tmp'))
        .pipe(plugins.livereload());

    plugins.watch(_.union(paths.server.scripts, testFiles))
        .pipe(plugins.plumber())
        .pipe(lintServerScripts())
        .pipe(plugins.livereload());

    gulp.watch('bower.json', ['wiredep:client']);
});

gulp.task('serve', cb => {
    runSequence(['clean:tmp', 'constant'],
        ['lint:scripts', 'inject'],
        ['wiredep:client'],
        ['transpile:client', 'styles'],
        ['start:server', 'start:client'],
        'watch',
        cb);
});

gulp.task('build', cb => {
    runSequence(
        'clean:dist',
        'clean:tmp',
        'inject',
        'wiredep:client',
        [
            'build:images',
            'copy:extras',
            'copy:assets',
            'transpile:server',
            'copy:server',
            'build:client'
        ],
        cb);
});

gulp.task('build:client', ['transpile:client', 'styles', 'html', 'constant'], () => {
    var manifest = gulp.src(`${paths.dist}/${clientPath}/assets/rev-manifest.json`);

    var appFilter = plugins.filter('**/app.js', {restore: true});
    var jsFilter = plugins.filter('**/*.js', {restore: true});
    var cssFilter = plugins.filter('**/*.css', {restore: true});
    var htmlBlock = plugins.filter(['**/*.!(html)'], {restore: true});

    return gulp.src(paths.client.mainView)
        .pipe(plugins.useref())
            .pipe(appFilter)
                .pipe(plugins.addSrc.append('.tmp/templates.js'))
                .pipe(plugins.concat('app/app.js'))
            .pipe(appFilter.restore)
            .pipe(jsFilter)
                .pipe(plugins.ngAnnotate())
                .pipe(plugins.uglify())
            .pipe(jsFilter.restore)
            .pipe(cssFilter)
                .pipe(plugins.minifyCss({
                    cache: true,
                    processImportFrom: ['!fonts.googleapis.com']
                }))
            .pipe(cssFilter.restore)
            .pipe(htmlBlock)
                .pipe(plugins.rev())
            .pipe(htmlBlock.restore)
        .pipe(plugins.revReplace({manifest}))
        .pipe(gulp.dest(`${paths.dist}/${clientPath}`));
});