'use strict';

angular.module('faster')
  .config(function($stateProvider) {
    $stateProvider
      .state('game', {
        url: '/game',
        templateUrl: 'app/game/gameview.html',
        controller: 'GameviewController',
        controllerAs: 'gv',
        authenticate: true
      })
      .state('game.restaurant', {
      	url: '/restaurant',
      	templateUrl: 'app/game/restaurant.html',
        authenticate: true
      })
      .state('game.map', {
      	url: '/map',
      	templateUrl: 'app/game/map.html',
        controller: 'GameMapController',
        controllerAs: 'gm',
        authenticate: true
      });
  });
