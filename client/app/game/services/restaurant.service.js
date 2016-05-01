(function () {
  function Restaurant($http, Auth) {
    const user = Auth.getCurrentUser();
    let activeRest;
    let activeRestId;
    let workers = {
      kitchen: {},
      outside: {},
    };
    let production = {};
    const mapRestaurants = {};
    const mapRestaurantLocs = [];

    const workerBase = 1;
    const baseProd = {
      megabucks: 0,
      loyals: 1,
      burgers: 5,
      drinks: 5,
      fries: 5,
    };
    const resourceNames = ['megabucks', 'loyals', 'burgers', 'fries', 'drinks'];
    const fieldTypes = 7;

    function getMapRestaurants() {
      if (this.mapRestaurantLocs.length !== 0) {
        return this.mapRestaurants;
      }
      console.time('Restaurant list start');
      return $http.get('/api/restaurant/map').then(response => {
        this.mapRestaurants = {};
        response.data.map(el => {
          this.mapRestaurants[el.location.join()] = {
            owner: el.owner,
          };
        });
        this.mapRestaurantLocs = Object.keys(this.mapRestaurants);
        console.timeEnd('Restaurant list start');
        return this.mapRestaurants;
      });
    }

    function calculateProd(base = baseProd, baseW = workerBase, wrk = this.workers.kitchen, modifier = this.activeRest.moneyPercent) {
      modifier = (100 - modifier) / 100;
      const unmodified = {
        burgers: (base.burgers + baseW * wrk['burger flipper']),
        drinks: (base.drinks + baseW * wrk['drink pourer']),
        fries: (base.fries + baseW * wrk['fry fryer']),
      };
      const modified = {
        burgers: Math.floor(unmodified.burgers * modifier),
        drinks: Math.floor(unmodified.drinks * modifier),
        fries: Math.floor(unmodified.fries * modifier),
        loyals: Math.floor(base.loyals + baseW * wrk.server),
      };
      let megabucks = base.megabucks;
      megabucks += Math.floor((unmodified.burgers - modified.burgers +
        unmodified.drinks - modified.drinks +
        unmodified.fries - modified.fries) * 0.5);
      return Object.assign(modified, { megabucks });
    }

    function setActiveRest(id = user.gameData.restaurants[0]._id) {
      const rest = user.gameData.restaurants.find(o => o._id === id);
      if (typeof rest === 'undefined') {
        // TODO: handle wrong restaurant
        throw 'Error, not user restaurant.';
      }
      activeRest = rest;
      activeRestId = id;
      mapWorkers(activeRest.workers);
      return rest;
    }

    function mapWorkers(workerArray) {
      workerArray.kitchen.forEach(w => workers.kitchen[w.title] = w.count);
      production = calculateProd(baseProd, workerBase, workers.kitchen, activeRest.moneyPercent);
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

    function modifyRes() {
      console.log(this.production);
      // TODO: stop this from running a lot more than it should
      // console.log('I\'m an asshole so It run multiple times for no reason!', this, activeRest);
      const timeDiff = (Date.now() - new Date(this.activeRest.updatedAt)) / (1000 * 60 * 60);
      const res = {};
      resourceNames.forEach(r => {
        res[r] = Math.floor(this.activeRest.resources[r] + this.production[r] * timeDiff);
      });
      return res;
    }

    function setMoneyProd(percent) {
      return $http.post(`api/restaurant/${this.activeRestId}/moneyProd`, { percent })
        .then(res => {
          this.updateRest(res.data);
          this.production = this.calculateProd();
          return res.data;
        })
        .catch(err => {
          console.error(err);
          throw 'Server error';
        });
    }

    function updateRest(data) {
      this.activeRest = data;
      mapWorkers(this.activeRest.workers);
    }

    function canAfford(costs) {
      const res = this.modifyRes();
      return resourceNames.every(r => costs[r] <= res[r]);
    }

    setActiveRest();

    return {
      activeRest,
      activeRestId,
      canAfford,
      calculateProd,
      displayedRestaurants,
      getMapRestaurants,
      mapRestaurants,
      mapRestaurantLocs,
      modifyRes,
      production,
      resourceNames,
      setActiveRest,
      setMoneyProd,
      updateRest,
      workers,
    };
  }

  angular.module('faster')
    .factory('Restaurant', Restaurant);
}());

