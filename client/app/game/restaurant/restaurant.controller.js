(function () {
  class RestaurantController {
    constructor($http, $scope, Auth, Building) {
      this.scope = $scope;
      this.Building = Building;
      this.user = Auth.getCurrentUser();
    }

    upgrade(building) {
      // Should canAfford be ran again?
      console.log(this.Building);
      this.Building.upgradeAttempt(building)
        .then(r => {
          this.scope.gv.activeRest = r;
        });
    }

    canAfford(building) {
      return this.Building.canBuy(building);
    }
  }
  angular.module('faster')
    .controller('RestaurantController', RestaurantController);
}());