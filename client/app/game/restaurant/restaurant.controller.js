(function () {
  class RestaurantController {
    constructor($http, $scope, Auth, Building) {
      this.scope = $scope;
      this.Building = Building;
      this.user = Auth.getCurrentUser();
      this.details = Building.details;
    }

    upgrade(building) {
      // Should canAfford be ran again?
      console.log(this.Building);
      this.Building.upgradeAttempt(building)
        .then(r => {
          this.scope.gv.activeRest = r;
        });
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
      // console.log(building, this.Building.requirements);
      // return true;
      return this.Building.meetsRequirements(building);
    }
  }
  angular.module('faster')
    .controller('RestaurantController', RestaurantController);
}());