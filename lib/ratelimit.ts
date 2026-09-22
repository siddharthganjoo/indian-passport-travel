import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { getRedisClient } from './redis';

let ratelimitInstance: Ratelimit | null = null;

export function getRatelimit(): Ratelimit | null {
  if (ratelimitInstance) return ratelimitInstance;

  const redis = getRedisClient();
  if (redis) {
    try {
      ratelimitInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 searches per min per IP
        analytics: true,
      });
      return ratelimitInstance;
    } catch (e) {
      console.warn('Failed to initialize Ratelimit with Redis:', e);
    }
  }
  return null;
}

// In-memory sliding window rate limiter fallback
const inMemoryHits = new Map<string, number[]>();

export async function checkRateLimit(ip: string): Promise<{ success: boolean; limit: number; remaining: number }> {
  const limiter = getRatelimit();
  if (limiter) {
    try {
      const result = await limiter.limit(ip);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
      };
    } catch (e) {
      console.warn('Redis rate limit error, falling back to memory:', e);
    }
  }

  // Fallback: in-memory sliding window (20 req / 60 seconds)
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  const userHits = inMemoryHits.get(ip) || [];
  const recentHits = userHits.filter((time) => now - time < windowMs);

  if (recentHits.length >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0 };
  }

  recentHits.push(now);
  inMemoryHits.set(ip, recentHits);

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - recentHits.length,
  };
}
