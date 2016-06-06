import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';

const MovementEventSchema = new Schema({
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
  },
  originId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
  },
  action: String, // attack, support, return
  targetLocation: Array,
  units: {},
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

// RestaurantSchema
//   .pre('save', function (next) {
//     this.nonce = mongoose.Types.ObjectId();
//     if (new Date() - this.updatedAt > 1000) {
//       updateRes(this);
//     }
//     next();
//   });

export default mongoose.model('MovementEvent', MovementEventSchema);
