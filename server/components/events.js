// import Restaurant from '../api/restaurant/restaurant.model';
import buildings from '../config/game/buildings';

function findSoonest(events) {
  let soonest = Infinity;
  events.building.forEach(b => { soonest = b.ends < soonest ? b.ends : soonest; });
  return soonest;
}

function queueBuilding(rest, building) {
  const time = Date.now();
  const buildTime = buildings.buildTimes[building.title][building.level];
  rest.events.building.push({
    type: 'build',
    target: building.title,
    queued: time,
    ends: time + buildTime,
  });
  rest.events.soonest = findSoonest(rest.events);
  return rest;
}

export default { queueBuilding };
