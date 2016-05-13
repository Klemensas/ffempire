import workers from '../../config/game/workers';
import { Restaurant, updateRes } from '../restaurant/restaurant.model';
import buildings from '../../config/game/buildings';

// Gets worker data
export function index(req, res) {
  return res.json(workers);
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
  // TODO: hire not only kitchen workers
  const data = req.body;
  if (data.rest && isOwner(req.user, data.rest) && typeof data.worker === 'string') {
    Restaurant.findById(data.rest)
      .then(handleEntityNotFound(res))
      .then(rest => {
        const workerTarget = workers.kitchenTitles.indexOf(data.worker) === -1 ? 'outside' : 'kitchen';
        const target = workers[`${workerTarget}Workers`].find(w => w.title === data.worker);
        // no worker found
        if (!target) {
          // TODO: error, no worker
          return res.status(401).end();
        }
        // loop through resources, subtracting the costs and returning if the player affords it
        rest = updateRes(rest);
        const affords = buildings.resources.every(r => {
          rest.resources[r] -= target.costs[r];
          return rest.resources[r] >= 0;
        });
        if (!affords) {
          // TODO: error, can't afford
          res.status(401).end();
          return;
        }
        const worker = rest.workers[workerTarget].find(w => w.title === target.title);
        worker.count++;
        Restaurant.update({ _id: rest._id, nonce: rest.nonce }, rest)
          .then(r => {
            if (r.nModified) {
              return res.json(rest);
            }
            return setTimeout(hireWorkers, 10, req, res);
          });
    });
  } else {
    console.log('error');
  }
}

