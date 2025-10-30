// Redis configuration with safe wrapper for optional Redis
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL =
  process.env.REDIS_URL ||
  `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST || 'queue-redis'}:${process.env.REDIS_PORT || 6379}/${process.env.REDIS_DB || 1}`;

const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

let redisAvailable = false;

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
  redisAvailable = false;
});

redisClient.on('connect', () => {
  console.info('✅ Redis connected');
  redisAvailable = true;
});

redisClient.on('ready', () => {
  console.info('✅ Redis ready');
  redisAvailable = true;
});

// Safe Redis wrapper that doesn't throw when unavailable
export const redis = {
  async get(key: string): Promise<string | null> {
    if (!redisAvailable) return null;
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.warn('Redis get error:', error);
      return null;
    }
  },

  async setex(key: string, seconds: number, value: string): Promise<void> {
    if (!redisAvailable) return;
    try {
      await redisClient.setex(key, seconds, value);
    } catch (error) {
      console.warn('Redis setex error:', error);
    }
  },

  async del(...keys: string[]): Promise<void> {
    if (!redisAvailable) return;
    try {
      await redisClient.del(...keys);
    } catch (error) {
      console.warn('Redis del error:', error);
    }
  },

  async incr(key: string): Promise<number> {
    if (!redisAvailable) return 1;
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.warn('Redis incr error:', error);
      return 1;
    }
  },

  async pexpire(key: string, milliseconds: number): Promise<void> {
    if (!redisAvailable) return;
    try {
      await redisClient.pexpire(key, milliseconds);
    } catch (error) {
      console.warn('Redis pexpire error:', error);
    }
  },

  async pttl(key: string): Promise<number> {
    if (!redisAvailable) return -1;
    try {
      return await redisClient.pttl(key);
    } catch (error) {
      console.warn('Redis pttl error:', error);
      return -1;
    }
  },

  async keys(pattern: string): Promise<string[]> {
    if (!redisAvailable) return [];
    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      console.warn('Redis keys error:', error);
      return [];
    }
  },

  // Pass through the original client for advanced usage
  client: redisClient,
};

export default redis;
