/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Restaurant from '../api/restaurant/restaurant.model';
// Loop through 100*100 fields generating restaurants at %
let chance = 0.22;
let restaurants = [];
for (let i = 1; i < 100; i++) {
    for (let j = 1; j < 100; j++) {
        if (Math.random() <= chance) {

            restaurants.push({
                name: 'Restaurant #' + i * j,
                location: [i, j]
            });
        }
    }
}

let users = [{
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test',
    gameData: {
        active: true,
        restaurants: null
    },
    role: 'admin'
}, {
    provider: 'local',
    name: 'Admin User',
    email: 'admin@admin.com',
    password: 'test',
    gameData: {
        active: true,
        restaurants: null
    }
}];

let savedRestaurants = [];

function populateUsers() {
    users.forEach((user, i) => {
        let ind = Math.floor(Math.random() * savedRestaurants.length);
        let rest = savedRestaurants.splice(ind, 1);
        user.gameData.restaurants = rest;
        User.createAsync(user)
            .then((user) => {
                if (i === users.length - 1) {
                    console.log('Seeding done.');
                }
            });
    });
    return;
}

console.log('Seeding database.');
User.find({}).removeAsync().then(() => {
    Restaurant.find({}).removeAsync()
        .then(() => {
            restaurants.forEach((rest, i) => {
                Restaurant.createAsync(rest)
                    .then((rest) => {
                        savedRestaurants.push(rest);
                        if (i === restaurants.length - 1) {
                            populateUsers();
                        }
                        return;
                    });
            });
            return true;
        });
    return true;
});
