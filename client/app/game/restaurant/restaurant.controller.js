(function () {
  class RestaurantController {
    constructor($http, $scope, $timeout, Auth, Restaurant, Building, Worker) {
      this.user = Auth.getCurrentUser();
      this.scope = $scope;

      this.buildings = Restaurant.activeRest.buildings;
      this.events = Restaurant.activeRest.events;

      this.restaurantWorkers = Restaurant.workers;
      this.buildingDetails = Building.details;
      this.prodSold = Restaurant.activeRest.moneyPercent;
      this.kitchenWorkerData = {};
      this.outsideWorkerData = {};

      this.Restaurant = Restaurant;
      this.Building = Building;
      this.Worker = Worker;

      this.recruitErrorMessage = '';

      let checkingQueue = false;
      function changeProdSold(percent) {
        if (this.canControlMoney()) {
          this.Restaurant.setMoneyProd(percent)
            .then(r => {
              this.scope.gv.production = this.Restaurant.production;
            });
        }
      }

      this.canControlMoney = function () {
        return true;
      };

      this.monitorQueues = function () {
        const time = Date.now();
        let expired;

        this.events.building.forEach(addLeftTime);
        this.events.unit.forEach(addLeftTime);

        if (expired && !checkingQueue) {
          checkingQueue = true;
          this.Restaurant.checkQueue().then(r => {
            checkingQueue = false;
            this.updateView(r);
          });
        }
        if (this.events.soonest) {
          $timeout(this.monitorQueues.bind(this), 1000);
        }

        function addLeftTime(el) {
          el.left = Math.ceil((new Date(el.ends) - time) / 1000);
          if (el.left < 0) {
            expired = true;
          }
          return el;
        }
      };

      this.prodSoldChange = _.debounce(changeProdSold, 500, { maxWait: 2000, trailing: true });

      if (this.events.soonest) {
        this.monitorQueues();
      }

      this.Worker.getWorkerData()
        .then((workers) => {
          this.kitchenWorkerData = workers.kitchenWorkers;
          this.outsideWorkerData = workers.outsideWorkers;
        });
    }

    updateView(r) {
      this.events = this.Restaurant.activeRest.events;
      const monitor = this.events.soonest === null;

      this.Building.mapBuildingValues();
      this.buildings = this.Restaurant.activeRest.buildings;
      this.restaurantWorkers = this.Restaurant.workers;

      this.scope.gv.resources = this.Restaurant.modifyRes();
      this.scope.gv.production = this.Restaurant.calculateProd();
      if (monitor) {
        console.log(this.buildings);
        console.log('update enable monitoring')
        this.monitorQueues();
      }
    }

    upgrade(building) {
      return this.Building.upgradeAttempt(building).then(r => this.updateView(r));
    }

    canTrainAny() {
      return this.Worker.canTrainAny();
    }

    canTrain(requirements) {
      return this.Worker.canTrain(requirements);
    }

    totalCost(workers) {
      const costs = {
        megabucks: 0,
        burgers: 0,
        fries: 0,
        drinks: 0,
        loyals: 0,
      };
      Object.keys(workers).forEach(w => {
        costs.megabucks += this.Worker.allWorkers[w].costs.megabucks * workers[w];
        costs.burgers += this.Worker.allWorkers[w].costs.burgers * workers[w];
        costs.fries += this.Worker.allWorkers[w].costs.fries * workers[w];
        costs.drinks += this.Worker.allWorkers[w].costs.drinks * workers[w];
        costs.loyals += this.Worker.allWorkers[w].costs.loyals * workers[w];
      });
      return costs;
    }

    hireAttempt(form) {
      if (form.$valid) {
        if (!this.Restaurant.canAfford(this.totalCost(this.recruit))) {
          form.$valid = false;
          return this.recruitErrorMessage = 'Cannot afford.';
        }
        return this.Worker.hireAttempt(this.recruit).then(r => this.updateView(r)).catch(e => { console.log('error', e); });
      }
      this.recruitErrorMessage = 'Hiring error.';
    }

    hireWorker(worker) {
      //! TODO:  add ability to hire more than one worker
      this.Worker.hireAttempt(worker).then(r => this.updateView(r));
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

