(function () {
  function Building($http, Restaurant) {
    const buildTimes = {};
    const costs = {};
    const details = {};
    const points = {};
    const requirements = {};
    let currentPoints = 0;
    let queuedLevels = {};

    function mapBuildingValues(costs = this.costs, buildTimes = this.buildTimes) {
      queuedLevels = {};
      for (const build of Restaurant.activeRest.events.building) {
        queuedLevels[build.target] = queuedLevels[build.target] + 1 || 1;
      }
      for (const building of Restaurant.activeRest.buildings) {
        const plusQ = queuedLevels[building.title] || 0;
        building.costs = costs[building.title][building.level + plusQ];
        building.buildTime = buildTimes[building.title][building.level + plusQ];
        building.queued = plusQ;
      }
    }

    function getBuildings() {
      return $http.get('/api/restaurant/buildings/')
        .then(res => {
          this.buildTimes = res.data.buildTimes;
          this.costs = res.data.costs;
          this.details = res.data.details;
          this.points = res.data.points;
          this.requirements = res.data.requirements;
          mapBuildingValues(this.costs, this.buildTimes);
          this.currentPoints = calculatePoints(this.points);
          return this;
        })
        .catch(err => {
          console.error(err);
          throw 'Server error';
        });
    }

    function calculatePoints(points = this.points) {
      let total = 0;
      for (const building of Restaurant.activeRest.buildings) {
        total += points[building.title][building.level];
      }
      return total;
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
      calculatePoints,
      currentPoints,
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

