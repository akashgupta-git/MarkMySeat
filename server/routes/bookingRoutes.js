const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const SeatMap = require("../models/SeatMap");
const Movie = require("../models/Movie");
const Screen = require("../models/Screen");
const { lockSeats, verifyLocks, releaseSeats, getLockedSeats } = require("../services/seatLock");

// helper to generate a seat layout based on screen config (or default 8x12)
function generateSeats(seatConfig) {
  const seatData = {};
  const totalRows = seatConfig?.rows || 8;
  const seatsPerRow = seatConfig?.seatsPerRow || 12;
  for (let r = 0; r < totalRows; r++) {
    const rowLetter = String.fromCharCode(65 + r); // A, B, C...
    for (let i = 1; i <= seatsPerRow; i++) {
      seatData[`${rowLetter}${i}`] = { booked: false, user: null };
    }
  }
  return seatData;
}

// get today's date as YYYY-MM-DD string
function todayDate() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// get all bookings for the currently logged in user
router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user })
      .populate("movie", "title posterUrl genre language duration")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// get a single booking by its mongo _id
router.get("/my-bookings/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user })
      .populate("movie", "title posterUrl genre language duration");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// cancel a booking (user self-service) — uses MongoDB transaction
router.put("/my-bookings/:id/cancel", protect, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const booking = await Booking.findOne({ _id: req.params.id, user: req.user }).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "confirmed") {
      await session.abortTransaction();
      return res.status(400).json({ message: `Cannot cancel — booking is already ${booking.status}` });
    }

    // free the seats back atomically
    const screenId = booking.screen || null;
    const showDate = booking.showDate || "";
    const seatMap = await SeatMap.findOne({
      movie: booking.movie,
      screen: screenId,
      showDate,
      showTime: booking.showTime,
    }).session(session);

    if (seatMap) {
      for (const seatNum of booking.seatNumbers) {
        const seat = seatMap.seats.get(seatNum);
        if (seat) {
          seatMap.seats.set(seatNum, { booked: false, user: null });
        }
      }
      seatMap.markModified("seats");
      await seatMap.save({ session });
    }

    booking.status = "cancelled";
    await booking.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    await session.abortTransaction();
    console.error("Cancel booking error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
});

// ─── Seat Lock endpoints (Redis) ──────────────────────────────────────────────

// Lock seats when user proceeds to payment (called from ConfirmBooking page)
router.post("/lock-seats", protect, async (req, res) => {
  try {
    const { movieId, seatNumbers, showTime, showDate } = req.body;

    if (!movieId || !Array.isArray(seatNumbers) || seatNumbers.length === 0 || !showTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const dateStr = showDate || todayDate();
    const result = await lockSeats(movieId, dateStr, showTime, seatNumbers, req.user);

    if (!result.success) {
      return res.status(409).json({
        message: `Seats already held by another user: ${result.conflicting.join(", ")}`,
        conflicting: result.conflicting,
      });
    }

    res.status(200).json({ message: "Seats locked", locked: true });
  } catch (err) {
    console.error("Lock seats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Release seats if user abandons the payment flow
router.post("/unlock-seats", protect, async (req, res) => {
  try {
    const { movieId, seatNumbers, showTime, showDate } = req.body;
    const dateStr = showDate || todayDate();
    await releaseSeats(movieId, dateStr, showTime, seatNumbers);
    res.status(200).json({ message: "Seats released" });
  } catch (err) {
    console.error("Unlock seats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Create Booking (with MongoDB transaction + Redis lock verification) ──────

/**
 * Core booking logic — extracted so it can be called directly or via BullMQ.
 * Runs inside a MongoDB transaction for atomicity.
 */
async function processBooking({ userId, movieId, seatNumbers, showTime, showDate, totalPrice, paymentId, foodOrders, foodTotal }) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const movie = await Movie.findById(movieId).populate("screen").session(session);
    if (!movie) throw new Error("Movie not found");

    const screenId = movie.screen?._id || null;
    const screenName = movie.screen?.name || "";
    const seatConfig = movie.screen?.seatConfig || null;
    const dateStr = showDate || todayDate();

    // Verify Redis locks are still valid (seats haven't expired)
    const lockCheck = await verifyLocks(movieId, dateStr, showTime, seatNumbers, userId);
    if (!lockCheck.valid && !lockCheck.skipped) {
      const problems = [];
      if (lockCheck.expired?.length) problems.push(`expired: ${lockCheck.expired.join(", ")}`);
      if (lockCheck.stolen?.length) problems.push(`taken: ${lockCheck.stolen.join(", ")}`);
      throw new Error(`Seat reservation lost (${problems.join("; ")}). Please try again.`);
    }

    let seatMap = await SeatMap.findOne({ movie: movieId, screen: screenId, showDate: dateStr, showTime }).session(session);

    // lazily create the seat map on first booking for this show
    if (!seatMap) {
      seatMap = new SeatMap({
        movie: movieId,
        screen: screenId,
        showDate: dateStr,
        showTime,
        seats: generateSeats(seatConfig),
      });
    }

    // validate all seats — belt-and-suspenders with the Redis lock
    for (const seatNum of seatNumbers) {
      const seat = seatMap.seats.get(seatNum);
      if (!seat) throw new Error(`Seat ${seatNum} not found`);
      if (seat.booked) throw new Error(`Seat ${seatNum} is already booked`);
    }

    // mark them booked
    for (const seatNum of seatNumbers) {
      seatMap.seats.set(seatNum, { booked: true, user: userId });
    }
    await seatMap.save({ session });

    // store one booking record for all the seats together
    const newBooking = new Booking({
      user: userId,
      movie: movieId,
      theatre: movie.theatre || null,
      screen: screenId,
      screenName,
      showDate: dateStr,
      seatNumber: seatNumbers.join(", "),
      seatNumbers,
      showTime,
      totalPrice: totalPrice || 0,
      paymentId: paymentId || "",
      foodOrders: foodOrders || [],
      foodTotal: foodTotal || 0,
    });
    await newBooking.save({ session });

    await session.commitTransaction();

    // Release Redis locks after successful commit
    await releaseSeats(movieId, dateStr, showTime, seatNumbers);

    return { message: "Booking successful", booking: newBooking };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

router.post("/create", protect, async (req, res) => {
  try {
    const { movieId, seatNumbers, showTime, showDate, totalPrice, paymentId, foodOrders, foodTotal } = req.body;

    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: "Seat numbers must be a non-empty array" });
    }

    const result = await processBooking({
      userId: req.user,
      movieId,
      seatNumbers,
      showTime,
      showDate,
      totalPrice,
      paymentId,
      foodOrders,
      foodTotal,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Booking error:", err);
    const status = err.message.includes("already booked") || err.message.includes("reservation lost") ? 409 : 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
});

// Export processBooking so BullMQ worker can call it
router._processBooking = processBooking;

// PUBLIC — verify a booking by bookingId (for QR code scanning)
router.get("/verify/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate("movie", "title posterUrl genre language duration")
      .populate("user", "name");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({
      valid: true,
      bookingId: booking.bookingId,
      status: booking.status || "confirmed",
      movie: booking.movie?.title || "Unknown",
      posterUrl: booking.movie?.posterUrl || "",
      genre: booking.movie?.genre || "",
      language: booking.movie?.language || "",
      duration: booking.movie?.duration || "",
      showTime: booking.showTime,
      showDate: booking.showDate || "",
      screenName: booking.screenName || "",
      seats: booking.seatNumbers,
      ticketCount: booking.seatNumbers.length,
      customerName: booking.user?.name || "Guest",
      totalPrice: booking.totalPrice || 0,
      foodTotal: booking.foodTotal || 0,
      bookedAt: booking.createdAt,
    });
  } catch (err) {
    console.error("Verify booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// returns which seats are still available for a given movie + showtime
router.get("/available-seats", async (req, res) => {
  try {
    const { movieId, showTime, showDate } = req.query;

    if (!movieId || !showTime) {
      return res.status(400).json({ message: "Missing movieId or showTime" });
    }

    const movie = await Movie.findById(movieId).populate("screen");
    const screenId = movie?.screen?._id || null;
    const seatConfig = movie?.screen?.seatConfig || null;
    const dateStr = showDate || todayDate();

    let seatMap = await SeatMap.findOne({ movie: movieId, screen: screenId, showDate: dateStr, showTime });

    // create layout based on screen config if no one has booked for this show yet
    if (!seatMap) {
      seatMap = new SeatMap({
        movie: movieId,
        screen: screenId,
        showDate: dateStr,
        showTime,
        seats: generateSeats(seatConfig),
      });
      await seatMap.save();
    }

    // collect seats that aren't booked
    const availableSeats = [];
    for (const [seatNum, data] of seatMap.seats.entries()) {
      if (!data.booked) availableSeats.push(seatNum);
    }

    // also fetch seats currently locked in Redis (held by users in payment flow)
    const lockedSeats = await getLockedSeats(movieId, dateStr, showTime);

    res.status(200).json({ availableSeats, lockedSeats });

  } catch (err) {
    console.error("Fetching seats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
