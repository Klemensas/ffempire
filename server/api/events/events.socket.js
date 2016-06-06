/**
 * Broadcast updates to client when the model changes
 */

'use strict';

import Events from './events';

// Model events to emit
const events = ['save', 'remove'];

function createListener(event, socket) {
  return function (doc) {
    console.log('i emit to client')
    console.log('---------')
    console.log(event)
    console.log(socket)
    console.log('---------')
    console.log(doc)
    console.log('---------')
    socket.emit(event, doc);
  };
}

function removeListener(event, type, listener) {
  return function () {
    Events[type].removeListener(event, listener);
  };
}

export function register(socket) {
  // Bind model events to socket events
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const buildingListener = createListener(`building:${event}`, socket);
    const movementListener = createListener(`movement:${event}`, socket);
    const recruitmentListener = createListener(`recruitment:${event}`, socket);

    Events.building.on(event, buildingListener);
    Events.movement.on(event, movementListener);
    Events.recruitment.on(event, recruitmentListener);

    socket.on('disconnect', removeListener(event, 'building', buildingListener));
    socket.on('disconnect', removeListener(event, 'movement', movementListener));
    socket.on('disconnect', removeListener(event, 'recruitment', recruitmentListener));
  }
}
