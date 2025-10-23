// Rate limiting middleware using Redis
import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
}

export function rateLimitMiddleware(options: RateLimitOptions) {
  const { windowMs, max, message } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `ratelimit:${identifier}:${req.path}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current).toString());

      if (current > max) {
        const ttl = await redis.pttl(key);
        res.setHeader('Retry-After', Math.ceil(ttl / 1000).toString());

        return res.status(429).json({
          success: false,
          error: 'Too Many Requests',
          message: message || 'Rate limit exceeded. Please try again later.',
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open - allow request if Redis fails
      next();
    }
  };
}

// Preset rate limiters
export const apiLimiter = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many API requests',
});

export const authLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts',
});

export const strictLimiter = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Rate limit exceeded for this endpoint',
});
