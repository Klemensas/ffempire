import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';

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
    this.updatedAt = new Date();
    next();
  });
export default mongoose.model('Restaurant', RestaurantSchema);
