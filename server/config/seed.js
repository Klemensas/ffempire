/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Restaurant from '../api/restaurant/restaurant.model';

// Thing.find({}).removeAsync()
//   .then(() => {
//     Thing.create({
//       name: 'Development Tools',
//       info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
//              'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
//              'Stylus, Sass, and Less.'
//     }, {
//       name: 'Server and Client integration',
//       info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
//              'AngularJS, and Node.'
//     }, {
//       name: 'Smart Build System',
//       info: 'Build system ignores `spec` files, allowing you to keep ' +
//              'tests alongside code. Automatic injection of scripts and ' +
//              'styles into your index.html'
//     }, {
//       name: 'Modular Structure',
//       info: 'Best practice client and server structures allow for more ' +
//              'code reusability and maximum scalability'
//     }, {
//       name: 'Optimized Build',
//       info: 'Build process packs up your templates as a single JavaScript ' +
//              'payload, minifies your scripts/css/images, and rewrites asset ' +
//              'names for caching.'
//     }, {
//       name: 'Deployment Ready',
//       info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
//              'and openshift subgenerators'
//     });
//   });

let restaurants = [
  {
    name: 'Kebab Town',
    location: [10,4]
  }, {
    name: 'Dux tawn',
    location: [5,2]
  }
];

let users = [
  {
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test',
    gameData: {
      active: true,
      restaurants: null
    },
    role: 'admin'
  },
  {
    provider: 'local',
    name: 'Admin User',
    email: 'admin@admin.com',
    password: 'test',
    gameData: {
      active: true,
      restaurants: null
    }
  }
]

function populateUsers(rest, i) {
  users[i].gameData.restaurants = rest;
  return User.createAsync(users[i]);
}

User.find({}).removeAsync().then(() => {
  Restaurant.find({}).removeAsync()
    .then(() => {
      restaurants.forEach((rest, i) => {
        Restaurant.createAsync(rest)
        .then((rest) => populateUsers(rest, i)); 
      });
    return true;
    });
    console.log('running seed...');
  return true;
});

