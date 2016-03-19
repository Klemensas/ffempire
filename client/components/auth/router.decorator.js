(function () {
  angular.module('faster.auth')
    .run(($rootScope, $state, $urlRouter, Auth) => {
      $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
        console.log(error);
      });
      // Auth user and redirect on no auth
      $rootScope.$on('$stateChangeStart', (event, next, params) => {
        if (!next.authenticate) {
          return;
        }
        if (typeof next.authenticate === 'string') {
          Auth.hasRole(next.authenticate, _.noop).then(has => {
            if (has) {
              return;
            }

            event.preventDefault();
            return Auth.isLoggedIn(_.noop).then(is => {
              $state.go(is ? 'main' : 'login');
            });
          });
        } else {
          event.preventDefault();
          Auth.isLoggedIn(_.noop).then(is => {
            if (is) {
              next.authenticate = false;
              $state.go(next, params);
              return;
            }

            event.preventDefault();
            $state.go('main');
          });
        }
      });
    });
}());
