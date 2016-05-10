import _ from 'lodash';
import { Restaurant, updateRes } from './restaurant.model';
import buildings from '../../config/game/buildings';
import workers from '../../config/game/workers';
import events from '../../components/events';

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
  return function (entity) {
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
  Restaurant.find({}, 'location owner').populate('owner', 'name')
  .then(result => {
    res.status(200).json(result);
  })
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

// Get building costs and stats
export function getBuildings(req, res) {
  const buildingData = {
    buildTimes: buildings.buildTimes,
    costs: buildings.costsNamed,
    requirements: buildings.requirements,
    details: buildings.details,
  };
  return res.json(buildingData);
}

export function updateQueues(req, res) {
  if (isOwner(req.user, req.params.id)) {
    return Restaurant.findById(req.params.id)
      .then(handleEntityNotFound(res))
      .then(rest => {
        const oldRest = Object.assign({}, rest);
        rest = events.checkQueueAndUpdate(rest);
        if (oldRest.soonest === rest.soonest) {
          return rest.save().then(r => res.json(r));
        }
        return res.status(401).end();
      });
  }
  res.status(401).end();
}

// Post, attempt to upgrade a building
export function upgradeBuilding(req, res) {
  // TODO: get the user, check if he owns the restaurant, check if he has enough resources and meets the reqs
  if (isOwner(req.user, req.params.id) && typeof req.body.building === 'string') {
    const target = req.body.building;
    return Restaurant.findById(req.params.id)
      .then(handleEntityNotFound(res))
      .then(rest => {
        rest = events.checkQueueAndUpdate(rest);
        rest = updateRes(rest);

        const queuedBuildings = events.queuedBuildings(rest.events.building);
        const buildingIndex = rest.buildings.findIndex(b => b.title === target);
        const building = rest.buildings[buildingIndex];
        const targetLevel = building.level + (queuedBuildings[building.title] || 0);
        const costs = buildings.levelCostsNamed(target, targetLevel);
        // loop through resources, subtracting the costs and returning if the player affords it
        const affords = buildings.resources.every(r => {
          rest.resources[r] -= costs[r];
          return rest.resources[r] >= 0;
        });
        if (!affords) {
          // TODO: error, can't afford
          return res.status(401).end();
        }
        events.queueBuilding(rest, building, targetLevel);
        // rest.set(`buildings.${buildingIndex}.level`, ++building.level);
        return rest.save().then(r => res.json(r));
      })
      .catch(handleError(res));
  }
  // TODO: error, non user restaurant
  res.status(401).end();
}

export function setMoneyProd(req, res) {
  if (isOwner(req.user, req.params.id) && typeof req.body.percent === 'string') {
    const percent = req.body.percent;
    Restaurant.findById(req.params.id)
      .then(handleEntityNotFound(res))
      .then(rest => {
        if (canSetMoneyProd(rest)) {
          rest = updateRes(rest);
          rest.moneyPercent = percent;
          rest.save().then(r => res.json(r));
        }
      })
      .catch(handleError(res));
  }
  // TODO: error, non user restaurant
  res.status(401).end();
}

function canSetMoneyProd(rest) {
  // TODO: check if player can control money prod
  return true;
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
        owner: user,
        workers: workers.defaultWorkers,
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
