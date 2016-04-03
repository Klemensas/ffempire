(function () {
  class RestaurantController {
    constructor($http, $scope, Auth, Restaurant, Building) {
      this.user = Auth.getCurrentUser();
      this.scope = $scope;
      this.buildings = Restaurant.activeRest.buildings;
      this.details = Building.details;

      this.Restaurant = Restaurant;
      this.Building = Building;
    }

    upgrade(building) {
      this.Building.upgradeAttempt(building)
        .then(r => {
          this.buildings = this.Restaurant.activeRest.buildings;
          this.scope.gv.resources = this.Restaurant.modifyRes();
        });
    }

    canTrain() {
      return this.Restaurant.activeRest.buildings.some(b => b.title === 'training' && b.level);
    }

    upgradeable(building) {
      if (building.costs) {
        return true;
      }
      return false;
    }
    canAfford(building) {
      return this.Building.canBuy(building);
    }

    meetsRequirements(building) {
      return this.Building.meetsRequirements(building);
    }
  }
  angular.module('faster')
    .controller('RestaurantController', RestaurantController);
}());