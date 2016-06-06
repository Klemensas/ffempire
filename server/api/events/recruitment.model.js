import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';

const RecruitmentEventSchema = new Schema({
  target: String,
  amount: Number,
  produced: Number,
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

export default mongoose.model('RecruitmentEvent', RecruitmentEventSchema);
