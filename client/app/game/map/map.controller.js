(function() {
  class MapController {
    constructor($http, $scope, $uibModal, $timeout, Auth, Restaurant) {
      this.user = Auth.getCurrentUser();
      this.movement = Restaurant.activeRest.events.movement;
      this.Restaurant = Restaurant;

      this.mapSize = 800;
      this.rowSize = 7;

      this.restaurants = this.Restaurant.mapRestaurants;
      const coords = [
        this.Restaurant.activeRest.location[0] - Math.floor(this.rowSize / 2),
        this.Restaurant.activeRest.location[1] - Math.floor(this.rowSize / 2),
      ];
      this.mapLocation = [
        coords[0] > 0 ? (coords[0] + this.rowSize < 100 ? coords[0] : 100 - this.rowSize) : 1,
        coords[1] > 0 ? (coords[1] + this.rowSize < 100 ? coords[1] : 100 - this.rowSize) : 1,
      ];

      this.displayed = this.Restaurant.displayedRestaurants(this.mapLocation, this.rowSize);

      this.xAxis = _.range(this.mapLocation[1], this.mapLocation[1] + this.rowSize);
      this.yAxis = _.range(this.mapLocation[0], this.mapLocation[0] + this.rowSize);

      this.modal = $uibModal;
      this.scope = $scope;

      let checkingQueue = false;
      this.monitorMovement = function () {
        const time = Date.now();
        let expired;
        this.movement.forEach(addLeftTime);

        if (expired && !checkingQueue) {
          checkingQueue = true;
          this.Restaurant.checkQueue().then(r => {
            checkingQueue = false;
            this.updateView(r);
          });
        }
        if (this.movement.length) {
          $timeout(this.monitorMovement.bind(this), 1000);
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


      if (this.movement.length) {
        this.monitorMovement();
      }
    }

    updateView(r) {
      this.movement = this.Restaurant.activeRest.events.movement;
      if (this.movement.length) {
        this.monitorMovement();
      }
    }

    mapScroll(position) {
      const coords = [
        this.mapLocation[0] + position[0] * this.rowSize,
        this.mapLocation[1] + position[1] * this.rowSize,
      ];
      this.mapLocation = [
        coords[0] > 0 ? (coords[0] + this.rowSize < 100 ? coords[0] : 100 - this.rowSize) : 1,
        coords[1] > 0 ? (coords[1] + this.rowSize < 100 ? coords[1] : 100 - this.rowSize) : 1,
      ];

      this.displayed = this.Restaurant.displayedRestaurants(this.mapLocation, this.rowSize);

      this.xAxis = _.range(this.mapLocation[1], this.mapLocation[1] + this.rowSize);
      this.yAxis = _.range(this.mapLocation[0], this.mapLocation[0] + this.rowSize);
    }

    isOwned(building) {
      if (building.owner === null) {
        return false;
      }
      return building.owner._id === this.user._id;
    }

    sendUnits(restaurant) {
      const modalInstance = this.modal.open({
        animation: true,
        templateUrl: 'app/game/modals/movement.template.html',
        controller: 'MovementController',
        controllerAs: 'mv',
        bindToController: true,
        size: 'md',
        resolve: { target: restaurant },
      });
      modalInstance.result.then(rest => {
        const monitoring = this.movement.length;
        this.movement = rest.events.movement;
        if (!monitoring) {
          this.monitorMovement();
        }
      });
    }
  }
  angular.module('faster')
    .controller('MapController', MapController);
}());