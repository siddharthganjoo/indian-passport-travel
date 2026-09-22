import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (redisInstance) return redisInstance;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      redisInstance = new Redis({ url, token });
      return redisInstance;
    } catch (e) {
      console.warn('Failed to initialize Upstash Redis client:', e);
      return null;
    }
  }

  return null;
}

// In-memory snapshot fallback cache for flight search when Redis is not configured
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>();

export async function getCachedData<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached) return cached;
    } catch (e) {
      console.warn(`Redis get failed for key ${key}:`, e);
    }
  }

  // Check fallback memory cache
  const mem = memoryCache.get(key);
  if (mem && mem.expiresAt > Date.now()) {
    return mem.data as T;
  }
  return null;
}

export async function setCachedData(key: string, data: unknown, ttlSeconds = 3600): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(key, data, { ex: ttlSeconds });
      return;
    } catch (e) {
      console.warn(`Redis set failed for key ${key}:`, e);
    }
  }

  // Fallback memory cache
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
