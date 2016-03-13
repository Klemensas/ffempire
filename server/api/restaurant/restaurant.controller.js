'use strict';

import _ from 'lodash';
import Restaurant from './restaurant.model';

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

// Generates a restaurant for new players
export function generateRestaurant(user) {
  return Restaurant.find({}, 'location -_id')
    .then(resList => {
      let location = findSuitable(resList);
      console.log(location);
      return Restaurant.create({
        name: user.name + 's restaurant',
        location: location
      });
    });
}

function findSuitable(list) {
  let x = Math.floor(Math.random() * 100 + 1);
  let y = Math.floor(Math.random() * 100 + 1);
  let duplicates = _.find(list, el => { return (el.location[0] === x && el.location[1] === y); });
  console.log('dup');
  console.log(duplicates);
  if(typeof duplicates === 'undefined') {
    return [x, y];
  }
  findSuitable(list);
}