(function () {
  function Worker($http, $q, Restaurant, Building) {
    let kitchenWorkers;
    let outsideWorkers;

    function canTrain(reqs) {
      if (!!reqs) {
        return Building.meetsRequirements(reqs);
      }
      return !kitchenWorkers ? false :
        kitchenWorkers.some(w => Building.meetsRequirements(w.requires));
    }

    function getWorkerData() {
      if (!!kitchenWorkers) {
        return $q.when({ kitchenWorkers, outsideWorkers });
      }
      return $http.get('/api/worker').then(response => {
        kitchenWorkers = response.data.kitchenWorkers;
        outsideWorkers = response.data.outsideWorkers;
        return { kitchenWorkers, outsideWorkers };
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

