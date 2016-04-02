(function () {
  class GameViewController {
    constructor(Building, $interval) {
      this.activeRest = Building.activeRest;
      this.resources = Building.modifyRes();
      this.production = Building.production;

      $interval(() => {
        this.resources = Building.modifyRes();
      }, 10000);
    }
  }
  angular.module('faster')
    .controller('GameViewController', GameViewController);
}());
