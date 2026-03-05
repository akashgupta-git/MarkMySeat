const Redis = require("ioredis");

// Redis connection — works with Redis Cloud, Upstash, or local installs.
// Just set REDIS_URL in .env. If it's missing, we skip Redis entirely
// and the app still works (just without real-time seat locking).

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