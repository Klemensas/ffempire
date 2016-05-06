(function () {
  class GameViewController {
    constructor(Restaurant, $interval) {
      this.activeRest = Restaurant.activeRest;
      this.resources = Restaurant.modifyRes();
      this.production = Restaurant.production;
      $interval(() => {
        this.resources = Restaurant.modifyRes();
      }, 10000);
    }
  }
  angular.module('faster')
    .controller('GameViewController', GameViewController);
}());
