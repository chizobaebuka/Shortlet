// src/redisClient.ts
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create a Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379', 
});

// Handle Redis connection events
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

export default redisClient;
