'use strict';

angular.module('faster.auth', [
  'faster.constants',
  'faster.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
