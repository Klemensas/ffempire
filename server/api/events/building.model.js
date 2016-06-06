import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';

const BuildingEventSchema = new Schema({
  action: String,
  target: String,
  ends: Date,
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

const B = mongoose.model('BuildingEvent', BuildingEventSchema);
console.log('hiiiiiiiiiiiiii');
setInterval(() => {
  console.log('insert')
  const bd = new B({ action: 'lab', target: 'all', ends: new Date() });
  bd.save();
}, 20000);

export default mongoose.model('BuildingEvent', BuildingEventSchema);
