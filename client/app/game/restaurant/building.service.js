(function () {
  function Building($http, Auth) {
    const user = Auth.getCurrentUser();
    const costs = {};
    const requirements = {};
    const activeRestId = null;
    const activeRest = null;
    const resourceNames = ['megabucks', 'loyals', 'burgers', 'fries', 'drinks'];

    function populateBuildings(restaurant, data) {
      const buildings = restaurant.buildings.map(b => {
        b.costs = data.costs[b.title][b.level];
        // b.requirements = data.requirements[b.title][b.level];
        return b;
      });
      restaurant.buildings = buildings;
      return restaurant;
    }

    function getBuildings(id = user.gameData.restaurants[0]._id) {
      const rest = user.gameData.restaurants.find(o => o._id === id);
      if (typeof rest === 'undefined') {
        throw 'Error, not user restaurant.';
      } else if (typeof costs[id] !== 'undefined') {
        console.log('Costs already defined');
        return this;
      }
      return $http.get(`/api/restaurant/${id}/buildings/`)
        .then(res => {
          this.activeRestId = id;
          costs[id] = res.data.costs;
          requirements[id] = res.data.requirements;
          this.activeRest = populateBuildings(rest, res.data);
          console.log(this.activeRest);
          return this;
        })
        .catch(err => {
          console.error(err);
          throw 'Server error';
        });
    }

    function upgradeAttempt(building = {}) {
      console.log('post data');
      return $http.post(`/api/restaurant/${this.activeRestId}/buildings/upgrade`, { building: building.title })
        .then(res => {
          this.activeRest = populateBuildings(res.data, {
            costs: this.costs[this.activeRestId],
            requirements: this.requirements[this.activeRestId],
          });
          return this.activeRest;
        })
        .catch(err => {
          console.error(err);
          throw 'Server error';
        });
    }

    function buildingCosts(building, level) {
      if (typeof this.costs[this.activeRestId][building] !== 'undefined') {
        return typeof level === 'number' ?
          this.costs[this.activeRestId][building][level] :
          this.costs[this.activeRestId][building];
      }
      return false;
    }

    function canBuy(building) {
      return resourceNames.every(r => building.costs[r] <= this.activeRest.resources[r]);
    }

    return {
      activeRest,
      buildingCosts,
      canBuy,
      costs,
      requirements,
      getBuildings,
      upgradeAttempt,
    };
  }

  angular.module('faster')
    .factory('Building', Building);
}());

