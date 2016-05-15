import Restaurant from '../api/restaurant/restaurant.model';
import buildings from '../config/game/buildings';
import workers from '../config/game/workers';

function findSoonest(events) {
  let soonest = 0;
  soonest = events.building.length ? events.building[0].ends : soonest;
  soonest = events.unit.length && events.unit[0].ends < soonest ? events.unit[0].ends : soonest;
  return soonest;
}

function queuedBuildings(buildings) {
  const queuedLevels = {};
  for (const build of buildings) {
    queuedLevels[build.target] = queuedLevels[build.target] + 1 || 1;
  }
  return queuedLevels;
}

function checkQueueAndUpdate(rest) {
  const time = Date.now();
  if (rest.events.soonest > time) {
    return rest;
  }
  // TODO: dry this mess up
  const endedBuildings = [];
  for (let i = 0; i < rest.events.building.length; i++) {
    const item = rest.events.building[i];
    if (item.ends > time) {
      break;
    }
    endedBuildings.push(item);
    rest.events.building.splice(i, 1);
    i--;
  }
  const endedUnits = [];
  for (let i = 0; i < rest.events.unit.length; i++) {
    const item = rest.events.unit[i];
    if (item.ends > time) {
      break;
    }
    endedUnits.push(item);
    rest.events.unit.splice(i, 1);
    i--;
  }
  updateBuildings(rest, endedBuildings);
  updateUnits(rest, endedUnits);
  rest.events.soonest = findSoonest(rest.events);
  return rest;
}

function updateBuildings(rest, targets) {
  targets.forEach(e => {
    const building = rest.buildings.find(b => b.title === e.target);
    building.level++;
  });
  return rest;
}
function updateUnits(rest, targets) {
  targets.forEach(e => {
    const unit = rest.workers.kitchen.find(w => w.title === e.target) || rest.workers.outside.find(w => w.title === e.target);
    unit.count += (e.amount - e.produced);
  });
  return rest;
}

function lastItemEnds(queue) {
  const item = queue[queue.length - 1];
  if (!item) {
    return 0;
  }
  return item.ends.getTime();
}

function queueBuilding(rest, building, level) {
  const time = Date.now();
  const buildTime = buildings.buildTimes[building.title][level] * 1000;
  const ends = (lastItemEnds(rest.events.building) || time) + buildTime;
  rest.events.building.push({
    type: 'build',
    target: building.title,
    queued: time,
    ends,
  });
  rest.events.soonest = findSoonest(rest.events);
  return rest;
}

function queueRecruits(rest, recruits, filteredUnits) {
  // Sort necessary if queueing multiple units and we'd like to queue in a non default order
  const targets = filteredUnits.sort((a, b) => workers.workerTypes.indexOf(a) - workers.workerTypes.indexOf(b));
  const time = Date.now();
  targets.forEach(t => {
    const unit = workers.allWorkers[t];
    const buildTime = unit.buildTime * recruits[t] * 1000;
    const ends = (lastItemEnds(rest.events.unit) || time) + buildTime;
    rest.events.unit.push({
      target: t,
      queued: time,
      amount: recruits[t],
      produced: 0,
      ends,
    });
  });
  rest.events.soonest = findSoonest(rest.events);
  return rest;
}

let updatingQueue = false;
function moveQueues() {
  if (!updatingQueue) {
    let updatedItems = 0;
    updatingQueue = true;
    const currentTime = new Date();
    const stream = Restaurant.find({ 'events.soonest': { $lte: currentTime } }).stream();
    stream.on('data', (res) => {
      stream.pause();
      res = checkQueueAndUpdate(res);
      updatedItems++;
      Restaurant.update({ _id: res._id, nonce: res.nonce }, res).then(() => stream.resume());
    })
    .on('error', (e) => {
      console.log('ERROR ERROR', e);
    })
    .on('close', () => {
      console.log(`${currentTime}, queue updated successfully, items affected #${updatedItems}`);
      updatingQueue = false;
    });
  }
  setTimeout(moveQueues, 5000 * 60);
}

moveQueues();

export default { queueBuilding, queuedBuildings, queueRecruits, checkQueueAndUpdate };
