'use strict';

const defaultBuildings = [{
  title: 'headquarters',
  level: 1,
}, {
  title: 'kitchen',
  level: 1,
}, {
  title: 'chairs',
  level: 0,
}];

const costs = {
  headquarters: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  kitchen: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  chairs: [
    [10, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
};

const requirements = {

};

const resources = ['megabucks', 'burgers', 'fries', 'drinks', 'loyals'];

function levelCosts(building, level) {
  return typeof costs[building] !== 'undefined' ? costs[building][level] : undefined;
}

function levelRequirements(building, level) {
  return 0;
}

function arrayToObject(arr, names) {
  return arr.reduce((p, c, i) => {
    p[names[i]] = c;
    return p;
  }, {});
}

// TODO: Currently resources are hard coded, maybe take the restaurant schema for them?
function toObject(target, names) {
  if (target.constructor === Object) {
    console.log('first')
    const keys = Object.keys(target);
    let res = {};
    keys.map(k => {
      res[k] = target[k].map(a => arrayToObject(a, names));
      return res;
    });
    return res;
  } else if (typeof target[0] !== 'object') {
    console.log('second', target, names)
    return arrayToObject(target, names);
  }
  console.log('third')
  return target.map((a) => arrayToObject(a, names));
}

function levelCostsNamed(building, level) {
  const costArray = levelCosts(building, level);
  return toObject(costArray, resources);
}

export default {
  resources,
  defaultBuildings,
  costs,
  requirements,
  levelCosts,
  levelRequirements,
  levelCostsNamed,
  costsNamed: toObject(costs, resources),
  requirementsNamed: toObject(requirements, resources),
};
