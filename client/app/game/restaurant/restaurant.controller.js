(function () {
  class RestaurantController {
    constructor($http, $scope, Auth, Restaurant, Building, Worker) {
      this.user = Auth.getCurrentUser();
      this.scope = $scope;

      this.buildings = Restaurant.activeRest.buildings;
      this.restaurantWorkers = Restaurant.workers;
      this.details = Building.details;

      this.kitchenWorkerData = {};
      this.outsideWorkerData = {};

      this.Restaurant = Restaurant;
      this.Building = Building;
      this.Worker = Worker;

      this.Worker.getWorkerData()
        .then((workers) => {
          this.kitchenWorkerData = workers.kitchenWorkers;
          this.outsideWorkerData = workers.outsideWorkers;
        });
    }

    upgrade(building) {
      this.Building.upgradeAttempt(building)
        .then(r => {
          this.buildings = this.Restaurant.activeRest.buildings;
          this.scope.gv.resources = this.Restaurant.modifyRes();
        });
    }

    canTrainAny() {
      return this.Worker.canTrainAny();
    }

    canTrain(requirements) {
      return this.Worker.canTrain(requirements);
    }

    hireWorker(worker) {
      //! TODO:  add ability to hire more than one worker
      this.Worker.hireAttempt(worker)
        .then(r => {
          this.restaurantWorkers = this.Restaurant.workers;
          this.scope.gv.resources = this.Restaurant.modifyRes();
        });
    }

    upgradeable(building) {
      if (building.costs) {
        return true;
      }
      return false;
    }
    canAfford(target) {
      return this.Restaurant.canAfford(target.costs);
    }

    meetsRequirements(building) {
      return this.Building.meetsRequirements(building.title);
    }
  }
  angular.module('faster')
    .controller('RestaurantController', RestaurantController);
}());

