'use strict';

angular.module('faster', [
  'faster.auth',
  'faster.admin',
  'faster.constants',
  'ngCookies',
  'ngResource',
  // 'ngSanitize',
  // 'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  // 'validation.match'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
