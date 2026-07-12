// src/redisClient.ts
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create a Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    // Capped exponential backoff so a transient Redis restart doesn't
    // permanently kill the client; caching just degrades until it recovers.
    reconnectStrategy: (retries) => Math.min(retries * 100, 5000),
  },
});

// Handle Redis connection events
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('reconnecting', () => {
  console.warn('Reconnecting to Redis...');
});

export default redisClient;
