(function () {
  function Building($http, Restaurant) {
    const buildTimes = {};
    const costs = {};
    const details = {};
    const requirements = {};

    function mapBuildingValues(costs = this.costs, buildTimes = this.buildTimes) {
      for (const building of Restaurant.activeRest.buildings) {
        building.costs = costs[building.title][building.level];
        building.buildTime = buildTimes[building.title][building.level];
      }
    }

    function getBuildings() {
      return $http.get('/api/restaurant/buildings/')
        .then(res => {
          this.buildTimes = res.data.buildTimes;
          this.costs = res.data.costs;
          this.requirements = res.data.requirements;
          this.details = res.data.details;
          mapBuildingValues(this.costs, this.buildTimes);
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
          mapBuildingValues(this.costs, this.buildTimes);
          return Restaurant.activeRest;
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

    function meetsRequirements(reqs) {
      const requires = typeof reqs === 'string' ? this.requirements[reqs] : reqs;
      if (!requires) {
        return true;
      }
      const reqKeys = Object.keys(requires);
      return Restaurant.activeRest.buildings.every(b => {
        if (reqKeys.indexOf(b.title) > -1 && requires[b.title] > b.level) {
          return false;
        }
        return true;
      });
    }


    return {
      buildingCosts,
      costs,
      details,
      mapBuildingValues,
      meetsRequirements,
      requirements,
      getBuildings,
      upgradeAttempt,
    };
  }

  angular.module('faster')
    .factory('Building', Building);
}());

