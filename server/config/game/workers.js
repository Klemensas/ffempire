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

export default {
  kitchenWorkers,
  outsideWorkers,
};

