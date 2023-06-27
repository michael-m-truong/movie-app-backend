const Redis = require('ioredis');
require('dotenv').config();

let redisInstance = null;

function redisConnect() {
  try {
    if (!redisInstance) {
      redisInstance = new Redis(process.env.REDIS_INTERNAL);

      redisInstance.on('connect', () => {
        console.log('Successfully connected to Redis server!');
      });

      redisInstance.on('error', (error) => {
        console.error('Error connecting to Redis server:', error);
      });
    }
  }
  catch (error) {
    console.log(error)
  }

  return redisInstance;
}

module.exports = redisConnect;
