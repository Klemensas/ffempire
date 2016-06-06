(function () {
  class GameViewController {
    constructor(Restaurant, $interval, $timeout, socket) {
      this.activeRest = Restaurant.activeRest;
      this.resources = Restaurant.modifyRes();
      this.production = Restaurant.production;
      this.incomingUnits = Restaurant.movement.incoming;
      this.Restaurant = Restaurant;

      $interval(() => {
        this.resources = Restaurant.modifyRes();
      }, 10000);

      let checkingQueue = false;
      this.monitorIncoming = function () {
        const time = Date.now();
        let expired;
        this.incomingUnits.forEach(addLeftTime);

        if (expired && !checkingQueue) {
          checkingQueue = true;
          this.Restaurant.updateIncoming().then(r => {
            checkingQueue = false;
          });
        }
        if (this.incomingUnits.length) {
          $timeout(this.monitorIncoming.bind(this), 1000);
        }

        function addLeftTime(el, i, array) {
          el.left = Math.ceil((new Date(el.ends) - time) / 1000);
          if (el.left < 0) {
            expired = true;
            array.splice(i, 1);
          }
          return el;
        }
      };

      if (this.incomingUnits.length) {
        this.monitorIncoming();
      }
    }
  }
  angular.module('faster')
    .controller('GameViewController', GameViewController);
}());
