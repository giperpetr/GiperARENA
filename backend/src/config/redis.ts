// Redis configuration
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL =
  process.env.REDIS_URL ||
  `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST || 'queue-redis'}:${process.env.REDIS_PORT || 6379}/${process.env.REDIS_DB || 1}`;

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redis.on('connect', () => {
  console.info('✅ Redis connected');
});

redis.on('ready', () => {
  console.info('✅ Redis ready');
});

export default redis;
