let redis: any = null;
try { const Redis = require('ioredis'); redis = new Redis(process.env.REDIS_URL!); } catch {}
export const getCachedResponse = async (key: string) => { if (!redis) return null; return redis.get(`chat:${key}`); };
export const setCachedResponse = async (key: string, value: string, ttl = 3600) => { if (redis) await redis.setex(`chat:${key}`, ttl, value); };
