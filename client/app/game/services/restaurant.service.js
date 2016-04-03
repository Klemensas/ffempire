(function () {
  function Restaurant($http, Auth) {
    const user = Auth.getCurrentUser();
    let activeRest;
    let activeRestId;
    const mapRestaurants = {};
    const mapRestaurantLocs = [];
    const production = {
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

    function setActiveRest(id = user.gameData.restaurants[0]._id) {
      const rest = user.gameData.restaurants.find(o => o._id === id);
      if (typeof rest === 'undefined') {
        // TODO: handle wrong restaurant
        throw 'Error, not user restaurant.';
      }
      activeRest = rest;
      activeRestId = id;
      return rest;
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
      // TODO: stop this from running a lot more than it should
      console.log('I\'m an asshole so It run multiple times for no reason!');
      const timeDiff = (Date.now() - new Date(activeRest.updatedAt)) / (1000 * 60 * 60);
      const res = {};
      resourceNames.forEach(r => {
        res[r] = Math.floor(this.activeRest.resources[r] + production[r] * timeDiff);
      });
      return res;
    }

    function updateRest(data) {
      this.activeRest = data;
    }

    setActiveRest();

    return {
      activeRest,
      activeRestId,
      displayedRestaurants,
      getMapRestaurants,
      mapRestaurants,
      mapRestaurantLocs,
      modifyRes,
      production,
      resourceNames,
      setActiveRest,
      updateRest,
    };
  }

  angular.module('faster')
    .factory('Restaurant', Restaurant);
}());
