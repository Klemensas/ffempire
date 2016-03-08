'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
import {Schema} from 'mongoose';

var RestaurantSchema = new mongoose.Schema({
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
  active: Boolean
});

export default mongoose.model('Restaurant', RestaurantSchema);