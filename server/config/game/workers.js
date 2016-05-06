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
}];
const outsideWorkers = [];
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
  outside: [],
};

export { resAffectedBy };
export default {
  defaultWorkers,
  kitchenWorkers,
  outsideWorkers,
  resAffectedBy,
};

