const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const SeatMap = require("../models/SeatMap");
const Movie = require("../models/Movie");

// helper to generate a fresh 8x12 seat layout (A1 through H12)
function generateDefaultSeats() {
  const seatData = {};
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  for (const row of rows) {
    for (let i = 1; i <= 12; i++) {
      seatData[`${row}${i}`] = { booked: false, user: null };
    }
  }
  return seatData;
}

// get all bookings for the currently logged in user
router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user }).populate("movie", "title");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// create a new booking with multiple seats
router.post("/create", protect, async (req, res) => {
  try {
    const { movieId, seatNumbers, showTime } = req.body;

    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: "Seat numbers must be a non-empty array" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    let seatMap = await SeatMap.findOne({ movie: movieId, showTime });

    // lazily create the seat map on first booking for this show
    if (!seatMap) {
      seatMap = new SeatMap({ movie: movieId, showTime, seats: generateDefaultSeats() });
    }

    // validate all seats first before marking any as booked
    for (const seatNum of seatNumbers) {
      const seat = seatMap.seats.get(seatNum);
      if (!seat) return res.status(404).json({ message: `Seat ${seatNum} not found` });
      if (seat.booked) return res.status(400).json({ message: `Seat ${seatNum} is already booked` });
    }

    // mark them booked
    for (const seatNum of seatNumbers) {
      seatMap.seats.set(seatNum, { booked: true, user: req.user });
    }
    await seatMap.save();

    // store one booking record for all the seats together
    const newBooking = new Booking({
      user: req.user,
      movie: movieId,
      seatNumber: seatNumbers.join(', '), // legacy field, keeping for now
      seatNumbers: seatNumbers,
      showTime
    });
    await newBooking.save();

    res.status(201).json({ message: "Booking successful", booking: newBooking });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// returns which seats are still available for a given movie + showtime
router.get("/available-seats", async (req, res) => {
  try {
    const { movieId, showTime } = req.query;

    if (!movieId || !showTime) {
      return res.status(400).json({ message: "Missing movieId or showTime" });
    }

    let seatMap = await SeatMap.findOne({ movie: movieId, showTime });

    // create default layout if no one has booked for this show yet
    if (!seatMap) {
      seatMap = new SeatMap({ movie: movieId, showTime, seats: generateDefaultSeats() });
      await seatMap.save();
    }

    // collect seats that aren't booked
    const availableSeats = [];
    for (const [seatNum, data] of seatMap.seats.entries()) {
      if (!data.booked) availableSeats.push(seatNum);
    }

    res.status(200).json({ availableSeats });

  } catch (err) {
    console.error("Fetching seats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;