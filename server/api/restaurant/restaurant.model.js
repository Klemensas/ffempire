'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

var RestaurantSchema = new Schema({
  name: String,
  location: [{type: Number}],
  resources: {

  },
  buildings: {
  	headquarters: Number,
  	seats: Number,
  	kitchen: Number
  },
  info: String,
  active: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model('Restaurant', RestaurantSchema);