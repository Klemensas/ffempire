import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';

export const tempBaseProduction = {
  burgers: 5,
  drinks: 5,
  fries: 5,
  loyals: 1,
  megabucks: 0,
};

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
  buildings: [{
    title: String,
    level: Number,
  }],
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

RestaurantSchema
  .pre('save', function(next) {
    updateRes(this);
    this.updatedAt = new Date();
    next();
  });

function updateRes(rest) {
  const lastTime = (Date.now() - rest.updatedAt) / (1000 * 60 * 60);
  const resKeys = Object.keys(tempBaseProduction);
  rest.resources = resKeys.map(r => {
    return rest.resources[r] += tempBaseProduction[r] * lastTime;
  });
  return rest;
}

export default mongoose.model('Restaurant', RestaurantSchema);
