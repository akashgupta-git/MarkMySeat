const Redis = require("ioredis");

// Redis connection — works with Redis Cloud, Upstash, or local Redis.
// Set REDIS_URL in your .env to the full connection string.
// Falls back to localhost:6379 for local dev.

let redis = null;
let redisReady = false;

function getRedis() {
  if (redis) return redis;

  const url = process.env.REDIS_URL;

  if (!url) {
    console.warn("REDIS_URL not set — seat locking disabled, falling back to in-memory checks only");
    return null;
  }

  redis = new Redis(url, {
    maxRetriesPerRequest: null, // required by BullMQ
    retryStrategy(times) {
      if (times > 5) return null; // stop retrying after 5 attempts
      return Math.min(times * 200, 2000);
    },
    enableReadyCheck: true,
  });

  redis.on("ready", () => {
    redisReady = true;
    console.log("Redis connected and ready");
  });
  redis.on("error", (err) => console.error("Redis error:", err.message));

  return redis;
}

function isRedisReady() {
  return redisReady;
}

module.exports = { getRedis, isRedisReady };