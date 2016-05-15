(function () {
  function Worker($http, $q, Restaurant, Building) {
    let kitchenWorkers;
    let outsideWorkers;
    let allWorkers;

    function canTrain(reqs) {
      if (!!reqs) {
        return Building.meetsRequirements(reqs);
      }
      return !this.kitchenWorkers ? false :
        this.kitchenWorkers.some(w => Building.meetsRequirements(w.requires));
    }

    function getWorkerData() {
      if (!!this.kitchenWorkers) {
        return $q.when({ kitchenWorkers, outsideWorkers });
      }
      return $http.get('/api/worker').then(response => {
        this.allWorkers = response.data.allWorkers;
        this.kitchenWorkers = response.data.kitchenWorkers;
        this.outsideWorkers = response.data.outsideWorkers;
        return {
          allWorkers: this.allWorkers,
          kitchenWorkers: this.kitchenWorkers,
          outsideWorkers: this.outsideWorkers,
        };
      });
    }

    function hireAttempt(workers) {
      return $http.post('/api/worker/hireWorker', { rest: Restaurant.activeRestId, workers })
        .then(res => {
          console.log('res');

          Restaurant.updateRest(res.data);
          return res.data;
        })
        .catch(err => {
          console.error(err);
          throw 'Server error';
        });
    }

    return {
      allWorkers,
      canTrain,
      getWorkerData,
      hireAttempt,
      kitchenWorkers,
      outsideWorkers,
      canTrainAny: canTrain,
    };
  }

  angular.module('faster')
    .factory('Worker', Worker);
}());

