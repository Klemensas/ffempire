(function () {
  function Building($http, Restaurant) {
    const costs = {};
    const details = {};
    const requirements = {};

    function findCurrentCosts(costs) {
      Restaurant.activeRest.buildings.map(b => {
        b.costs = costs[b.title][b.level];
      });
    }

    function getBuildings() {
      return $http.get(`/api/restaurant/${Restaurant.activeRestId}/buildings/`)
        .then(res => {
          this.costs = res.data.costs;
          this.requirements = res.data.requirements;
          this.details = res.data.details;
          findCurrentCosts(this.costs);
          return this;
        })
        .catch(err => {
          console.error(err);
          throw 'Server error';
        });
    }


    function upgradeAttempt(building = {}) {
      return $http.post(`/api/restaurant/${Restaurant.activeRestId}/buildings/upgrade`, { building: building.title })
        .then(res => {
          Restaurant.updateRest(res.data);
          findCurrentCosts(this.costs);
          return this.activeRest;
        })
        .catch(err => {
          console.error(err);
          throw 'Server error';
        });
    }

    function buildingCosts(building, level) {
      if (typeof this.costs[building] !== 'undefined') {
        return typeof level === 'number' ?
          this.costs[building][level] :
          this.costs[building];
      }
      return false;
    }

    function canBuy(building) {
      const res = Restaurant.modifyRes();
      return Restaurant.resourceNames.every(r => building.costs[r] <= res[r]);
    }

    function meetsRequirements(building) {
      const reqs = this.requirements[building.title];
      if (!reqs) {
        return true;
      }
      const reqKeys = Object.keys(reqs);
      return Restaurant.activeRest.buildings.every(b => {
        if (reqKeys.indexOf(b.title) > -1 && reqs[b.title] > b.level) {
          return false;
        }
        return true;
      });
    }

    return {
      buildingCosts,
      canBuy,
      costs,
      details,
      meetsRequirements,
      requirements,
      getBuildings,
      upgradeAttempt,
    };
  }

  angular.module('faster')
    .factory('Building', Building);
}());
