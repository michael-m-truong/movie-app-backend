const Redis = require('ioredis');
require('dotenv').config();

let redisInstance = null;

function redisConnect() {
  try {
    if (!redisInstance) {
      redisInstance = new Redis(process.env.REDIS_EXTERNAL);

      redisInstance.on('connect', () => {
        console.log('Successfully connected to Redis server!');
      });

      redisInstance.on('error', (error) => {
        //console.log('Error connecting to Redis server');
        redisInstance.disconnect();
        redisInstance = null
        return 
      });
    }
  }
  catch (error) {
    console.log(error)
  }

  return redisInstance;
}

module.exports = redisConnect;
