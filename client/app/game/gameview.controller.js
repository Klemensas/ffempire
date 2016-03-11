'use strict';

(function() {

class GameviewController {

  constructor($http, $scope) {
    this.$http = $http;
    this.awesomeThings = [];

    $scope.$on('$destroy', function() {
      // socket.unsyncUpdates('thing');
    });
  }
}

angular.module('faster')
  .controller('GameviewController', GameviewController);

})();