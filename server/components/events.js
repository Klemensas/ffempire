import Restaurant from '../api/restaurant/restaurant.model';
import buildings from '../config/game/buildings';
function findSoonest(events) {
  let soonest = Infinity;
  events.building.forEach(b => { soonest = b.ends < soonest ? b.ends : soonest; });
  return soonest < Infinity ? soonest : null;
}

function checkQueueAndUpdate(rest) {
  const time = Date.now();
  if (rest.events.soonest > time) {
    return false;
  }
  const endedEvents = [];
  for (let i = 0; i < rest.events.building.length; i++) {
    const item = rest.events.building[i];
    if (item.ends <= time) {
      endedEvents.push(item);
      rest.events.building.splice(i, 1);
      i--;
    }
  }
  updateBuildings(rest, endedEvents);
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

function queueBuilding(rest, building) {
  const time = Date.now();
  const buildTime = buildings.buildTimes[building.title][building.level];
  rest.events.building.push({
    type: 'build',
    target: building.title,
    queued: time,
    ends: time + buildTime * 1000,
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
      res.save().then(() => stream.resume());
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

export default { queueBuilding, checkQueueAndUpdate };
