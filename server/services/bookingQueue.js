const { Queue, Worker, QueueEvents } = require("bullmq");
const { getRedis } = require("../config/redis");

// BullMQ needs an IORedis-compatible connection.
// We reuse the same Redis instance from our config.

let bookingQueue = null;
let bookingWorker = null;
let queueEvents = null;

/**
 * Initialise the booking queue + worker.
 * Call this once from server.js after Redis is connected.
 */
function initBookingQueue(processBookingFn) {
  const redis = getRedis();
  if (!redis) {
    console.warn("BullMQ skipped — no Redis connection");
    return null;
  }

  const connection = {
    // BullMQ accepts a connection object or an IORedis instance
    // Passing the raw instance directly
    connection: redis,
  };

  bookingQueue = new Queue("bookings", { connection: redis });

  bookingWorker = new Worker(
    "bookings",
    async (job) => {
      // job.data contains the full booking payload
      return processBookingFn(job.data);
    },
    {
      connection: redis,
      concurrency: 1, // process one booking at a time — serialises seat writes
    }
  );

  bookingWorker.on("completed", (job) => {
    console.log(`Booking job ${job.id} completed`);
  });

  bookingWorker.on("failed", (job, err) => {
    console.error(`Booking job ${job?.id} failed:`, err.message);
  });

  // QueueEvents is needed for waitUntilFinished()
  queueEvents = new QueueEvents("bookings", { connection: redis });

  console.log("BullMQ booking queue initialised");
  return bookingQueue;
}

/**
 * Add a booking job to the queue.
 * Returns the BullMQ Job so callers can await the result.
 */
async function enqueueBooking(data) {
  if (!bookingQueue) {
    // Queue not available — return null so caller falls back to direct processing
    return null;
  }

  const job = await bookingQueue.add("create-booking", data, {
    attempts: 2,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 100, // keep last 100 completed jobs
    removeOnFail: 50,
  });

  return job;
}

/**
 * Wait for a job to finish and return its result.
 * Times out after 30 seconds.
 */
async function waitForJob(job, timeoutMs = 30000) {
  if (!job) return null;

  try {
    const result = await job.waitUntilFinished(
      queueEvents,
      timeoutMs
    );
    return result;
  } catch (err) {
    // Check if the job failed
    const state = await job.getState();
    if (state === "failed") {
      const failedReason = job.failedReason || "Booking processing failed";
      throw new Error(failedReason);
    }
    throw err;
  }
}

function getBookingQueue() {
  return bookingQueue;
}

module.exports = {
  initBookingQueue,
  enqueueBooking,
  waitForJob,
  getBookingQueue,
};