/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// import Thing from '../api/thing/thing.model';
import Message from '../api/message/message.model';
import User from '../api/user/user.model';
import Restaurant from '../api/restaurant/restaurant.model';
import buildings from './game/buildings';
import { defaultWorkers } from './game/workers';


// Loop through 100*100 fields generating restaurants at %
const chance = 0.22;
const restaurants = [];
for (let i = 1; i < 100; i++) {
  for (let j = 1; j < 100; j++) {
    if (Math.random() <= chance) {
      restaurants.push({
        name: `Restaurant #${i * j}`,
        location: [i, j],
        buildings: buildings.defaultBuildings,
        workers: defaultWorkers,
      });
    }
  }
}

const users = [{
  provider: 'local',
  name: 'Test User',
  email: 'test@test.com',
  password: 'test',
  gameData: {
    active: true,
    restaurants: null,
  },
  role: 'admin',
}, {
  provider: 'local',
  name: 'Admin User',
  email: 'admin@admin.com',
  password: 'test',
  gameData: {
    active: true,
    restaurants: null,
  },
}];

const messages = [{
  owner: 'Init',
  content: 'Hello. Nice to see you here.',
}];
Message.find({}).remove().then(() => {
  messages.forEach(m => Message.create(m));
});

let savedRestaurants = [];

function populateUsers() {
  users.forEach((user, i) => {
    const ind = Math.floor(Math.random() * savedRestaurants.length);
    const rest = savedRestaurants.splice(ind, 1);
    user.gameData.restaurants = rest;
    User.create(user)
      .then(u => {
        rest[0].owner = u;
        return rest[0].save().then(() => {
          if (i === users.length - 1) {
            console.log('Seeding done.');
          }
          return true;
        });
      });
  });
  return;
}

User.find({}).remove().then(() => {
  Restaurant.find({}).remove()
    .then(() => {
      restaurants.forEach((rest, i) => {
        Restaurant.create(rest)
          .then(r => {
            savedRestaurants.push(r);
            if (i === restaurants.length - 1) {
              populateUsers();
            }
            return true;
          });
      });
      return true;
    });
  return true;
});
