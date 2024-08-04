import redisClient from "./redisClient";

async function testRedis() {
  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis');

    // Test Redis command
    const pong = await redisClient.ping();
    console.log(`Redis server responded with: ${pong}`);

    await redisClient.quit();
  } catch (err) {
    console.error('Error connecting to Redis:', err);
  }
}

testRedis();


