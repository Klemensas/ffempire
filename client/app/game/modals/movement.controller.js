(function() {
  class MovementController {
    constructor($scope, $uibModalInstance, Restaurant, Worker, target) {
      const defaultW = Restaurant.workers.availableOutside;
      this.targetLocation = target.location.split(',');
      this.targetId = target.id;
      this.distance = findDistance(this.targetLocation, Restaurant.activeRest.location);
      this.active = false;
      this.workers = Object.keys(defaultW).map(w => ({ title: w, free: defaultW[w], used: 0 }));
      this.workerData = Worker.outsideWorkerMap;
      this.used = [];
      this.travelTime = 0;
      this.Modal = $uibModalInstance;
      this.Worker = Worker;

      function findDistance(location, origin) {
        return +(Math.sqrt(origin.reduce((p, c, i) => p += Math.pow(c - location[i], 2), 0)).toFixed(3));
      }
    }

    inputUnit(unit) {
      this.used = this.workers.filter(w => w.used);
      this.travelTime = this.calculateTravelTime(this.findSlowest(this.used));
      this.active = this.used.length;
    }

    findSlowest(units) {
      return units.reduce((p, c) => p < this.workerData[c.title].speed ? this.workerData[c.title].speed : p, 0);
    }

    calculateTravelTime(slowest) {
      return slowest * this.distance * 60;
    }

    cancel() {
      this.Modal.dismiss('cancel');
    }

    send(type) {
      const units = {};
      for (const unit of this.used) {
        units[unit.title] = unit.used;
      }
      this.Worker.sendWorkers(type, units, this.targetLocation, this.targetId)
        .then(this.Modal.close);
    }
  }
  angular.module('faster')
    .controller('MovementController', MovementController);
}());
