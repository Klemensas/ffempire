(function () {
  function Restaurant($http, Auth) {
    const user = Auth.getCurrentUser();
    let activeRest;
    let activeRestId;
    let workers = {
      kitchen: {},
      outside: {},
      availableOutside: {},
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
    const movement = {
      incoming: [],
    };
    let gameData = {};

    function getMapRestaurants() {
      if (this.mapRestaurantLocs.length !== 0) {
        return this.mapRestaurants;
      }
      console.time('Restaurant list start');
      return $http.get('/api/restaurant/map').then(response => {
        this.mapRestaurants = {};
        response.data.forEach(el => {
          this.mapRestaurants[el.location.join()] = {
            owner: el.owner,
            id: el._id,
          };
        });
        this.mapRestaurantLocs = Object.keys(this.mapRestaurants);
        console.timeEnd('Restaurant list start');
        return this.mapRestaurants;
      });
    }

    function getGameData() {
      if (this.gameData) {
        return this.gameData;
      }
      return $http.get('/api/restaurant/gameData').then(response => {
        this.gameData = response.data;
        return this.gameData;
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

    function checkQueue() {
      return $http.get(`api/restaurant/${this.activeRestId}/updateQueues`).then(res => {
        this.updateRest(res.data);
        return this.activeRest;
      });
    }

    function updateIncoming() {
      return $http.get(`api/restaurant/${this.activeRestId}/updateIncoming`).then(res => {
        this.updateRest(res.data);
        return this.activeRest;
      });
    }

    function mapWorkers(workerArray) {
      workerArray.kitchen.forEach(w => workers.kitchen[w.title] = w.count);
      workerArray.outside.forEach(w => {
        workers.outside[w.title] = w.count;
        workers.availableOutside[w.title] = w.count - w.moving;
      });
      production = calculateProd(baseProd, workerBase, workers.kitchen, activeRest.moneyPercent);
    }

    function displayedRestaurants(location, size) {
      Math.seedrandom(window.location.host);
      const map = [];
      for (let i = 0; i < size; i++) {
        map[i] = [];
        for (let j = 0; j < size; j++) {
          const loc = `${location[0] + i},${location[1] + j}`;
          const rest = this.mapRestaurants[loc];
          if (typeof rest !== 'undefined') {
            map[i].push({
              id: rest.id,
              owner: rest.owner,
              field: 1,
              location: loc,
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
      if (this) {
        this.activeRest = data;
        mapWorkers(this.activeRest.workers);
        return;
      }
      activeRest = data;
      mapWorkers(activeRest.workers);
    }

    function canAfford(costs) {
      const res = this.modifyRes();
      return resourceNames.every(r => costs[r] <= res[r]);
    }

    function eventReceive(e) {
      const data = JSON.parse(e.data);
      if (data.movement) {
        movement.incoming = movement.incoming.concat(data.movement);
        console.log('movement', movement.incoming);
      } else if (data.newMovement) {
        movement.incoming.push(data.newMovement);
      } else if (data.rest) {
        // Dirty stuff  
        window.location.reload();
      } else {
        console.log('othr event', e.data)
      }
    }

    function restaurantEvents() {
      const source = new EventSource(`/api/restaurant/${activeRestId}/events?access_token=${Auth.getToken()}`);

      source.addEventListener('message', eventReceive, false);
      source.addEventListener('error', (e) => {
        console.log('err', e)
        if (e.readyState === EventSource.CLOSED) {
          restaurantEvents();
        }
      }, false);
    }

    setActiveRest();
    restaurantEvents();

    return {
      activeRest,
      activeRestId,
      canAfford,
      calculateProd,
      checkQueue,
      displayedRestaurants,
      getGameData,
      getMapRestaurants,
      movement,
      mapRestaurants,
      mapRestaurantLocs,
      modifyRes,
      production,
      resourceNames,
      setActiveRest,
      setMoneyProd,
      updateIncoming,
      updateRest,
      workers,
    };
  }

  angular.module('faster')
    .factory('Restaurant', Restaurant);
}());

