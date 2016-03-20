angular.module('faster')
  .config($stateProvider => {
    $stateProvider
      .state('game', {
        url: '/game',
        templateUrl: 'app/game/game.html',
        abstract: true,
        authenticate: true,
        resolve: {
          buildingPromise: ['Building', Building => Building.getBuildings()],
        },
        controller: function(Building) {
          this.activeRest = Building.activeRest;
        },
        controllerAs: 'gv',
      })
      .state('game.restaurant', {
        url: '',
        templateUrl: 'app/game/restaurant/restaurant.html',
        controller: 'RestaurantController',
        controllerAs: 'gr',
        authenticate: true,
      })
      .state('game.map', {
        url: '/map',
        templateUrl: 'app/game/map/map.html',
        controller: 'MapController',
        controllerAs: 'gm',
        authenticate: true,
        resolve: {
          mapRestaurantPromise: ['Building', Building => Building.getMapRestaurants()],
        },
      });
  });
