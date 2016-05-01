import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';
import { resAffectedBy } from '../../config/game/workers';
import _ from 'lodash';

export const tempBaseProduction = {
  burgers: 5,
  drinks: 5,
  fries: 5,
  loyals: 1,
  megabucks: 0,
};

const bucksPerFood = 0.5;
const workerProduction = 1;

const RestaurantSchema = new Schema({
  name: String,
  location: [{ type: Number }],
  resources: {
    loyals: {
      type: Number,
      default: 10,
    },
    megabucks: {
      type: Number,
      default: 1000,
    },
    burgers: {
      type: Number,
      default: 0,
    },
    fries: {
      type: Number,
      default: 0,
    },
    drinks: {
      type: Number,
      default: 0,
    },
  },
  moneyPercent: {
    type: Number,
    default: 20,
  },
  buildings: [{
    title: String,
    level: Number,
  }],
  workers: {
    kitchen: [{
      title: String,
      count: Number,
    }],
    outside: [{
      title: String,
      count: Number,
    }],
  },
  info: String,
  active: {
    type: Boolean,
    default: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

function updateRes(rest) {
  const lastTime = (Date.now() - rest.updatedAt) / (1000 * 60 * 60);
  const resKeys = Object.keys(tempBaseProduction);
  rest.updatedAt = new Date();
  let megabucks = 0;
  resKeys.forEach(r => {
    const wi = _.findKey(rest.workers.kitchen, { title: resAffectedBy[r] });
    const workerCount = wi ? rest.workers.kitchen[wi].count : 0;
    const modifier = r === 'loyals' ? 1 : (100 - rest.moneyPercent) / 100;
    const unmodified = (tempBaseProduction[r] + workerCount * workerProduction) * lastTime;
    const modified = unmodified * modifier;
    if (r !== 'loyals') {
      megabucks += (unmodified - modified) * bucksPerFood;
    }
    rest.resources[r] += modified;
  });
  rest.resources.megabucks += megabucks;
  return rest;
}

RestaurantSchema
  .pre('save', function (next) {
    if (new Date() - this.updatedAt > 1000) {
      updateRes(this);
    }
    next();
  });

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
export { updateRes };
export default mongoose.model('Restaurant', RestaurantSchema);
