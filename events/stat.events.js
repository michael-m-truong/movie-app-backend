const EventEmitter = require('events');
const statEmitter = new EventEmitter();

statEmitter.setMaxListeners(50);

module.exports = statEmitter;
