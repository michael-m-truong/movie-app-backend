const Redis = require('ioredis');
require('dotenv').config();

let redisInstance = null;

function redisConnect() {
  if (!redisInstance) {
    redisInstance = new Redis(process.env.REDIS_INTERNAL);

    redisInstance.on('connect', () => {
      console.log('Successfully connected to Redis server!');
    });

    redisInstance.on('error', (error) => {
      console.error('Error connecting to Redis server:', error);
    });
  }

  return redisInstance;
}

module.exports = redisConnect;
