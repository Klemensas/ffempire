const defaultBuildings = [{
  title: 'headquarters',
  level: 1,
}, {
  title: 'storage',
  level: 1,
}, {
  title: 'cellar',
  level: 1,
}, {
  title: 'kitchen',
  level: 1,
}, {
  title: 'chairs',
  level: 0,
}, {
  title: 'training',
  level: 0,
}, {
  title: 'interior',
  level: 0,
}];

const costs = {
  headquarters: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  storage: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  cellar: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  kitchen: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [100, 1, 1, 0, 0],
    [50, 1, 1, 1, 1],
  ],
  chairs: [
    [10, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  training: [
    [10, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  interior: [
    [10, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
};

const requirements = {
  headquarters: null,
  storage: null,
  cellar: null,
  kitchen: null,
  chairs: null,
  training: {
    headquarters: 3,
    interior: 1,
  },
  interior: {
    headquarters: 3,
  },
};

const details = {
  headquarters: 'Every operation in your restaurant goes through your headquarters. Your HQ reduces build time. Higher level HQ allows building more buildings.',
  storage: 'Storage is used for storring all of the resources your restaurant holds. Strangely enough your money is stored here as well. Upgrading it increases the maximum amount you can store.',
  cellar: 'Your workers are housed in your cellar due to high living costs of Megapolis. Upgrading the cellar increases maximum amount of workers you can have.',
  kitchen: 'The kitchen holds all of your equipment and upgrading it increases your base production of all goods.',
  chairs: 'The seating area of your restaurant determines how many total loyal clients can you seat.',
  training: 'You send your loyal clients to the training room, some unspeakable things happen inside and you have new workers! The higher the level the faster they come out as workers.',
  interior: 'While seemingly useless to you, the interior of your restaurant is very important to your workers. Upgrade it to unlock more worker types.',
};

const resources = ['megabucks', 'burgers', 'fries', 'drinks', 'loyals'];

function levelCosts(building, level) {
  return typeof costs[building] !== 'undefined' ? costs[building][level] : undefined;
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
    const keys = Object.keys(target);
    let res = {};
    keys.map(k => {
      res[k] = target[k].map(a => arrayToObject(a, names));
      return res;
    });
    return res;
  } else if (typeof target[0] !== 'object') {
    return arrayToObject(target, names);
  }
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
  details,
  requirements,
  levelCosts,
  levelCostsNamed,
  costsNamed: toObject(costs, resources),
};

