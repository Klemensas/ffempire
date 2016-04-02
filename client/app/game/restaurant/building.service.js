(function() {
  function Building($http, Auth) {
    const user = Auth.getCurrentUser();
    const fieldTypes = 7;
    const requirements = {};
    const costs = {};
    const details = {};
    const activeRestId = null;
    const activeRest = null;
    const resourceNames = ['megabucks', 'loyals', 'burgers', 'fries', 'drinks'];
    const mapRestaurants = {};
    const mapRestaurantLocs = [];
    let modifiedRes = {};

    const production = {
      megabucks: 0,
      loyals: 1,
      burgers: 5,
      drinks: 5,
      fries: 5,
    };

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
          this.costs = res.data.costs;
          this.requirements = res.data.requirements;
          this.activeRest = populateBuildings(rest, res.data);
          this.details = res.data.details;
          return this;
        })
        .catch(err => {
          console.error(err);
          throw 'Server error';
        });
    }

    function modifyRes() {
      const timeDiff = (Date.now() - new Date(this.activeRest.updatedAt)) / (1000 * 60 * 60);
      resourceNames.forEach(r => {
        modifiedRes[r] = Math.floor(this.activeRest.resources[r] + production[r] * timeDiff);
      });
      return modifiedRes;
    }

    function getMapRestaurants() {
      if (this.mapRestaurantLocs.length !== 0) {
        return this.mapRestaurants;
      }
      console.time('Restaurant list start')
      return $http.get('/api/restaurant/map').then(response => {
        this.mapRestaurants = {};
        response.data.map(el => {
          this.mapRestaurants[el.location.join()] = {
            owner: el.owner,
          };
        });
        this.mapRestaurantLocs = Object.keys(this.mapRestaurants);
        console.timeEnd('Restaurant list start')
        return this.mapRestaurants;
      });
    }

    function upgradeAttempt(building = {}) {
      return $http.post(`/api/restaurant/${this.activeRestId}/buildings/upgrade`, { building: building.title })
        .then(res => {
          this.activeRest = populateBuildings(res.data, {
            costs: this.costs,
            requirements: this.requirements,
          });
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
      return resourceNames.every(r => building.costs[r] <= this.activeRest.resources[r]);
    }

    function meetsRequirements(building) {
      const reqs = this.requirements[building.title];
      if (!reqs) {
        return true;
      }
      const reqKeys = Object.keys(reqs);
      return this.activeRest.buildings.every(b => {
        if (reqKeys.indexOf(b.title) > -1 && reqs[b.title] > b.level) {
          return false;
        }
        return true;
      });
    }

    function displayedRestaurants(location, size) {
      Math.seedrandom(window.location.host);
      const map = [];
      for (let i = 0; i < size; i++) {
        map[i] = [];
        for (let j = 0; j < size; j++) {
          const loc = `${location[0] + i},${location[1] + j}`;
          if (typeof this.mapRestaurants[loc] !== 'undefined') {
            map[i].push({
              owner: this.mapRestaurants[loc].owner,
              field: 1,
            });
            continue;
          }
          map[i].push({
            field: Math.floor(Math.random() * fieldTypes + 1),
          });
        }
      }
      return map;
    }

    return {
      activeRest,
      buildingCosts,
      canBuy,
      costs,
      details,
      displayedRestaurants,
      mapRestaurants,
      mapRestaurantLocs,
      meetsRequirements,
      modifyRes,
      production,
      requirements,
      getBuildings,
      getMapRestaurants,
      upgradeAttempt,
    };
  }

  angular.module('faster')
    .factory('Building', Building);
}());