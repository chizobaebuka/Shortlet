import redisClient from '../db/redisClient';
import logger from './logger';

/**
 * Cache is treated as best-effort: a Redis outage should degrade to
 * "no cache" rather than fail the request, so every call is guarded.
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!redisClient.isOpen) return null;

  try {
    const cached = await redisClient.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch (err: any) {
    logger.warn('Cache read failed, continuing without cache', { key, error: err.message });
    return null;
  }
};

export const setCache = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
  if (!redisClient.isOpen) return;

  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err: any) {
    logger.warn('Cache write failed', { key, error: err.message });
  }
};
