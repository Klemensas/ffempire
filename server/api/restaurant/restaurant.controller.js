'use strict';

import _ from 'lodash';
import Restaurant from './restaurant.model';
import buildings from '../../config/game/buildings';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Things
export function index(req, res) {
  Restaurant.find()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Restaurant from the DB
export function show(req, res) {
  Restaurant.findById(req.params.id)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function restaurantView(req, res) {
  res.status(200).send();
}

export function map(req, res) {
  Restaurant.find({}, 'location')
  .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Restaurant in the DB
export function create(req, res) {
  Restaurant.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Restaurant in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Restaurant.findById(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Restaurant from the DB
export function destroy(req, res) {
  Restaurant.findById(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Get current building costs and stats for a specific restaurant
export function getBuildings(req, res) {
  const restaurant = isOwner(req.user, req.params.id);
  if (restaurant === -1) {
     // TODO: error, non user restaurant
    return res.status(404).end();
  }
  const costsAndReqs = {
    costs: buildings.costsNamed,
    requirements: buildings.requirementsNamed,
  };
  return res.json(costsAndReqs);
}

// Post, attempt to upgrade a building
export function upgradeBuilding(req, res) {
  // TODO: get the user, check if he owns the restaurant, check if he has enough resources and meets the reqs
  if (isOwner(req.user, req.params.id) && typeof req.body.building === 'string') {
    const target = req.body.building;
    Restaurant.findById(req.params.id)
      .then(handleEntityNotFound(res))
      .then(rest => {
        const buildingIndex = rest.buildings.findIndex(b => b.title === target);
        const building = rest.buildings[buildingIndex];

        const costs = buildings.levelCostsNamed(target, building.level);

        // loop through resources, subtracting the costs and returning if the player affords it
        const affords = buildings.resources.every(r => {
          rest.resources[r] -= costs[r];
          return rest.resources[r] >= 0;
        });
        if (!affords) {
          // TODO: error, can't afford
          res.status(401).end();
          return;
        }
        building.level++;
        // rest.set(`buildings.${buildingIndex}.level`, ++building.level);
        rest.save()
          .then(r => {
            console.log(r);
            res.json(r);
          });
      })
      .catch(handleError(res));
  } else {
    // TODO: error, non user restaurant
    res.status(404).end();
  }
}

// Generates a restaurant for new players
export function generateRestaurant(user) {
  return Restaurant.find({}, 'location -_id')
    .then(resList => {
      const location = findSuitable(resList);
      return Restaurant.create({
        location,
        name: `${user.name}'s restaurant`,
        buildings: buildings.defaultBuildings,
      });
    });
}

function isOwner(user, restaurantId) {
  return user.gameData.restaurants.some(r => r.equals(restaurantId));
}

function findSuitable(list) {
  const x = Math.floor(Math.random() * 100 + 1);
  const y = Math.floor(Math.random() * 100 + 1);
  const duplicates = _.find(list, el => { return (el.location[0] === x && el.location[1] === y); });
  if (typeof duplicates === 'undefined') {
    return [x, y];
  }
  return findSuitable(list);
}
