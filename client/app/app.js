'use strict';

angular.module('faster', [
  'faster.auth',
  'faster.admin',
  'faster.constants',
  'ngCookies',
  'ngResource',
  // 'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  // 'validation.match'
])
  .config(($urlRouterProvider, $locationProvider) => {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  })
  .run($rootScope => {
    $rootScope.timeLeft = function (time) {
      if (time < 0) {
        return 'delayed';
      }
      const timeArray = [
        time / 3600 | 0,
        time / 60 % 60 | 0,
        time % 60 | 0,
      ];
      return timeArray.map(v => v < 10 ? `0${v}` : v).join(':');
    };
    $rootScope.formatDate = function (time) {
      return new Date(time);
    };
  });
