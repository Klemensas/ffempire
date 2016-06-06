import { EventEmitter } from 'events';
import Building from './building.model';
import Movement from './movement.model';
import Recruitment from './recruitment.model';

const Events = {
  building: new EventEmitter(),
  movement: new EventEmitter(),
  recruitment: new EventEmitter(),
};

// Set max event listeners (0 == unlimited)
// ThingEvents.setMaxListeners(0);

// Model events
const events = {
  save: 'save',
  remove: 'remove',
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Building.schema.post(e, emitEvent(event, 'building'));
  Movement.schema.post(e, emitEvent(event, 'movement'));
  Recruitment.schema.post(e, emitEvent(event, 'recruitment'));
}

function emitEvent(event, type) {
  return function(doc) {
    console.log('i emit save', event)
    console.log('--------------')
    Events[type].emit(event + ':' + doc._id, doc);
    Events[type].emit(event, doc);
  };
}

export default Events;
