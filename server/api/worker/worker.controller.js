import workers from '../../config/game/workers';
import { Restaurant, updateRes } from '../restaurant/restaurant.model';
import buildings from '../../config/game/buildings';
import events from '../../components/events';
import _ from 'lodash';

// Gets worker data
export function index(req, res) {
  return res.json({
    kitchenWorkers: workers.kitchenWorkerArray,
    outsideWorkers: workers.outsideWorkerArray,
  });
}

function isOwner(user, restaurantId) {
  return user.gameData.restaurants.some(r => r.equals(restaurantId));
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

// Add worker to user restaurant
export function hireWorkers(req, res) {
  const data = req.body;
  if (data.rest && isOwner(req.user, data.rest) && data.workers) {
    const targets = Object.keys(data.workers);
    const correctValues = targets.every(t => !!workers.allWorkers[t]);
    if (correctValues) {
      return Restaurant.findById(data.rest)
        .then(handleEntityNotFound(res))
          .then(rest => {
            const costs = {
              megabucks: 0,
              burgers: 0,
              fries: 0,
              drinks: 0,
              loyals: 0,
            };
            const canBuild = targets.every(t => {
              const workerData = workers.allWorkers[t];
              Object.keys(workerData.costs).forEach(k => costs[k] += workerData.costs[k] * data.workers[t]);
              return Object.keys(workerData.requires).every(k => rest.buildings.find(b => b.title === k).level >= workerData.requires[k]);
            });
            rest = updateRes(rest);
            const canAfford = Object.keys(costs).every(r => {
              rest.resources[r] -= costs[r];
              return rest.resources[r] >= 0;
            });
            if (canBuild && canAfford) {
              rest = events.queueRecruits(rest, data.workers);
              Restaurant.update({ _id: rest._id, nonce: rest.nonce }, rest)
                .then(r => {
                  if (r.nModified) {
                    return res.json(rest);
                  }
                  return setTimeout(hireWorkers, 10, req, res);
                });
            }
          });
    }
  }
  return res.status(401).end();
}

