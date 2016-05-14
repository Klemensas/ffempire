const kitchenWorkers = [{
  title: 'burger flipper',
  costs: {
    megabucks: 10,
    burgers: 0,
    fries: 0,
    drinks: 0,
    loyals: 0,
  },
  requires: {
    kitchen: 2,
  },
  buildTime: 600,
}, {
  title: 'fry fryer',
  costs: {
    megabucks: 15,
    burgers: 0,
    fries: 0,
    drinks: 10,
    loyals: 3,
  },
  requires: {
    kitchen: 2,
  },
  buildTime: 600,
}, {
  title: 'drink pourer',
  costs: {
    megabucks: 1,
    burgers: 0,
    fries: 0,
    drinks: 0,
    loyals: 0,
  },
  requires: {
    kitchen: 2,
  },
  buildTime: 600,
}, {
  title: 'server',
  costs: {
    megabucks: 0,
    burgers: 0,
    fries: 0,
    drinks: 0,
    loyals: 0,
  },
  requires: {
    kitchen: 5,
  },
  buildTime: 600,
}];
const outsideWorkers = [{
  title: 'bouncer',
  costs: {
    megabucks: 0,
    burgers: 0,
    fries: 0,
    drinks: 0,
    loyals: 0,
  },
  requires: {
    kitchen: 5,
  },
  speed: 10,
  combat: {
    attack: 1,
    defense: 10,
  },
  buildTime: 900,
}, {
  title: 'mobster',
  costs: {
    megabucks: 0,
    burgers: 0,
    fries: 0,
    drinks: 0,
    loyals: 0,
  },
  requires: {
    kitchen: 5,
  },
  speed: 20,
  combat: {
    attack: 20,
    defense: 50,
  },
  buildTime: 2100,
}, {
  title: 'punk',
  costs: {
    megabucks: 0,
    burgers: 0,
    fries: 0,
    drinks: 0,
    loyals: 0,
  },
  requires: {
    kitchen: 5,
  },
  speed: 20,
  combat: {
    attack: 10,
    defense: 0,
  },
  buildTime: 700,
}, {
  title: 'thug',
  costs: {
    megabucks: 0,
    burgers: 0,
    fries: 0,
    drinks: 0,
    loyals: 0,
  },
  requires: {
    kitchen: 5,
  },
  speed: 25,
  combat: {
    attack: 40,
    defense: 10,
  },
  buildTime: 1800,
}, {
  title: 'spy',
  costs: {
    megabucks: 0,
    burgers: 0,
    fries: 0,
    drinks: 0,
    loyals: 0,
  },
  requires: {
    kitchen: 5,
  },
  speed: 25,
  combat: {
    attack: 0,
    defense: 0,
  },
  buildTime: 1000,
}, {
  title: 'inspector',
  costs: {
    megabucks: 0,
    burgers: 0,
    fries: 0,
    drinks: 0,
    loyals: 0,
  },
  requires: {
    kitchen: 5,
  },
  speed: 10,
  combat: {
    attack: 30,
    defense: 10,
  },
  buildTime: 3000,
}, {
  title: 'corrupt official',
  costs: {
    megabucks: 0,
    burgers: 0,
    fries: 0,
    drinks: 0,
    loyals: 0,
  },
  requires: {
    kitchen: 5,
  },
  speed: 10,
  combat: {
    attack: 5,
    defense: 5,
  },
  buildTime: 6000,
}];
const resAffectedBy = {
  burgers: 'burger flipper',
  fries: 'fry fryer',
  drinks: 'drink pourer',
  loyals: 'server',
};

const defaultWorkers = {
  kitchen: [{
    title: 'burger flipper',
    count: 0,
  }, {
    title: 'fry fryer',
    count: 0,
  }, {
    title: 'drink pourer',
    count: 0,
  }, {
    title: 'server',
    count: 0,
  },
  ],
  outside: [{
    title: 'bouncer',
    count: 0,
  }, {
    title: 'mobster',
    count: 0,
  }, {
    title: 'punk',
    count: 0,
  }, {
    title: 'thug',
    count: 0,
  }, {
    title: 'spy',
    count: 0,
  }, {
    title: 'inspector',
    count: 0,
  }, {
    title: 'corrupt official',
    count: 0,
  }],
};


const workerTypes = [
  'burger flipper',
  'fry fryer',
  'drink pourer',
  'server',
  'bouncer',
  'mobster',
  'punk',
  'thug',
  'spy',
  'inspector',
  'corrupt official',
];

export { resAffectedBy, defaultWorkers };
export default {
  allWorkers: outsideWorkers.concat(kitchenWorkers),
  defaultWorkers,
  kitchenWorkers,
  outsideWorkers,
  resAffectedBy,
  workerTypes,
};

