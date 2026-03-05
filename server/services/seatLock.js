const { getRedis } = require("../config/redis");

// Seat lock TTL — how long seats are held while user completes payment (seconds)
const SEAT_LOCK_TTL = 600; // 10 minutes

/**
 * Build the Redis key for a specific seat in a show.
 */
function seatKey(movieId, showDate, showTime, seatNum) {
  return `seatlock:${movieId}:${showDate}:${showTime}:${seatNum}`;
}

/**
 * Attempt to lock multiple seats for a user.
 * Uses SET NX (only-if-not-exists) so two concurrent requests
 * cannot lock the same seat — Redis guarantees atomicity per key.
 *
 * Returns { success: true } or { success: false, conflicting: [...] }
 */
async function lockSeats(movieId, showDate, showTime, seatNumbers, userId) {
  const redis = getRedis();
  if (!redis) {
    // Redis not available — skip locking (fallback to DB-only check)
    return { success: true, skipped: true };
  }

  const keys = seatNumbers.map((s) => seatKey(movieId, showDate, showTime, s));

  // Pipeline: attempt SET NX EX on every seat
  const pipeline = redis.pipeline();
  for (const key of keys) {
    pipeline.set(key, userId.toString(), "EX", SEAT_LOCK_TTL, "NX");
  }
  const results = await pipeline.exec();

  const locked = [];
  const conflicting = [];

  results.forEach(([err, reply], i) => {
    if (err || reply !== "OK") {
      conflicting.push(seatNumbers[i]);
    } else {
      locked.push(seatNumbers[i]);
    }
  });

  if (conflicting.length > 0) {
    // Rollback any locks we did acquire
    if (locked.length > 0) {
      const rollback = redis.pipeline();
      for (const seat of locked) {
        rollback.del(seatKey(movieId, showDate, showTime, seat));
      }
      await rollback.exec();
    }
    return { success: false, conflicting };
  }

  return { success: true };
}

/**
 * Verify that a user still owns the locks for the given seats.
 * Called right before creating the booking to ensure reservation hasn't expired.
 */
async function verifyLocks(movieId, showDate, showTime, seatNumbers, userId) {
  const redis = getRedis();
  if (!redis) return { valid: true, skipped: true };

  const keys = seatNumbers.map((s) => seatKey(movieId, showDate, showTime, s));
  const values = await redis.mget(...keys);

  const expired = [];
  const stolen = [];

  values.forEach((val, i) => {
    if (val === null) {
      expired.push(seatNumbers[i]);
    } else if (val !== userId.toString()) {
      stolen.push(seatNumbers[i]);
    }
  });

  if (expired.length > 0 || stolen.length > 0) {
    return { valid: false, expired, stolen };
  }

  return { valid: true };
}

/**
 * Release locks after successful booking or on cancellation.
 */
async function releaseSeats(movieId, showDate, showTime, seatNumbers) {
  const redis = getRedis();
  if (!redis) return;

  const keys = seatNumbers.map((s) => seatKey(movieId, showDate, showTime, s));
  await redis.del(...keys);
}

/**
 * Get all currently locked seats for a show (for UI display).
 * Scans Redis for matching keys — works well at small scale.
 */
async function getLockedSeats(movieId, showDate, showTime) {
  const redis = getRedis();
  if (!redis) return [];

  const pattern = `seatlock:${movieId}:${showDate}:${showTime}:*`;
  const keys = [];
  let cursor = "0";

  do {
    const [nextCursor, batch] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 200);
    cursor = nextCursor;
    keys.push(...batch);
  } while (cursor !== "0");

  // extract seat numbers from key names
  return keys.map((k) => k.split(":").pop());
}

module.exports = {
  lockSeats,
  verifyLocks,
  releaseSeats,
  getLockedSeats,
  SEAT_LOCK_TTL,
};