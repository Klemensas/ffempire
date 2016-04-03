(function() {
  class MapController {
    constructor($http, $scope, Auth, Restaurant) {
      this.user = Auth.getCurrentUser();
      this.Restaurant = Restaurant;

      this.mapSize = 800;
      this.rowSize = 7;

      this.restaurants = this.Restaurant.mapRestaurants;
      const coords = [
        this.Restaurant.activeRest.location[0] - Math.floor(this.rowSize / 2),
        this.Restaurant.activeRest.location[1] - Math.floor(this.rowSize / 2),
      ];
      this.mapLocation = [
        coords[0] > 0 ? (coords[0] + this.rowSize < 100 ? coords[0] : 100 - this.rowSize) : 1,
        coords[1] > 0 ? (coords[1] + this.rowSize < 100 ? coords[1] : 100 - this.rowSize) : 1,
      ];

      this.displayed = this.Restaurant.displayedRestaurants(this.mapLocation, this.rowSize);

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

      this.displayed = this.Restaurant.displayedRestaurants(this.mapLocation, this.rowSize);

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