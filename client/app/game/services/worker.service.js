(function () {
  function Worker($http, Auth) {
    const user = Auth.getCurrentUser();

    return {
      production,
    };
  }

  angular.module('faster')
    .factory('Worker', Worker);
}());