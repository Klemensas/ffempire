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
          console.log('oo');
          this.activeRest = Building.activeRest;
          console.log(this.activeRest);
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
      });
  });
