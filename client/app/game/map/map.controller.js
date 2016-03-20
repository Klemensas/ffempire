(function() {
  class MapController {
    constructor($http, $scope, Auth, Building) {
      this.user = Auth.getCurrentUser();
      // console.log(this.user.gameData.restaurants.map(r => r.location.join()));
      // this.userMaps = this.user.gameData.restaurants
      this.Building = Building;

      this.mapSize = 800;
      this.rowSize = 7;

      this.restaurants = this.Building.mapRestaurants;
      const coords = [
        this.Building.activeRest.location[0] - Math.floor(this.rowSize / 2),
        this.Building.activeRest.location[1] - Math.floor(this.rowSize / 2),
      ];
      this.mapLocation = [
        coords[0] > 0 ? (coords[0] + this.rowSize < 100 ? coords[0] : 100 - this.rowSize) : 1,
        coords[1] > 0 ? (coords[1] + this.rowSize < 100 ? coords[1] : 100 - this.rowSize) : 1,
      ];

      this.displayed = this.Building.displayedRestaurants(this.mapLocation, this.rowSize);
      console.log(this.displayed);

      this.xAxis = _.range(this.mapLocation[1], this.mapLocation[1] + this.rowSize);
      this.yAxis = _.range(this.mapLocation[0], this.mapLocation[0] + this.rowSize);
    }

    mapScroll(position) {
      const coords = [
        this.mapLocation[0] + position[0] * this.rowSize,
        this.mapLocation[1] + position[1] * this.rowSize,
      ];
      this.mapLocation = [
        coords[0] > 0 ? (coords[0] + this.rowSize < 100 ? coords[0] : 100 - this.rowSize) : 1,
        coords[1] > 0 ? (coords[1] + this.rowSize < 100 ? coords[1] : 100 - this.rowSize) : 1,
      ];

      this.displayed = this.Building.displayedRestaurants(this.mapLocation, this.rowSize);

      this.xAxis = _.range(this.mapLocation[1], this.mapLocation[1] + this.rowSize);
      this.yAxis = _.range(this.mapLocation[0], this.mapLocation[0] + this.rowSize);
    }

    isOwned(building) {
      if (building.owner === null) {
        return false;
      }
      return building.owner._id === this.user._id;
    }
  }
  angular.module('faster')
    .controller('MapController', MapController);
}());