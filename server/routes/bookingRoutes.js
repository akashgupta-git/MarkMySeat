const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const SeatMap = require("../models/SeatMap");
const Movie = require("../models/Movie");

// ✅ GET: My Bookings (No change needed)
router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user }).populate("movie", "title");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST: Create Booking (Updated for multiple seats)
router.post("/create", protect, async (req, res) => {
  try {
    // We now expect 'seatNumbers' (an array) instead of 'seatNumber'
    const { movieId, seatNumbers, showTime } = req.body;

    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: "Seat numbers must be a non-empty array" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    let seatMap = await SeatMap.findOne({ movie: movieId, showTime });

    // Auto-create seat map if it doesn't exist
    if (!seatMap) {
      const seatData = {};
      for (let i = 1; i <= 30; i++) {
        seatData[`S${i}`] = { booked: false, user: null };
      }
      seatMap = new SeatMap({ movie: movieId, showTime, seats: seatData });
      // We will save it after checks
    }

    // Check if ALL seats are available *before* booking any
    for (const seatNum of seatNumbers) {
      const seat = seatMap.seats.get(seatNum);
      if (!seat) return res.status(404).json({ message: `Seat ${seatNum} not found` });
      if (seat.booked) return res.status(400).json({ message: `Seat ${seatNum} is already booked` });
    }

    // Book all seats
    for (const seatNum of seatNumbers) {
      seatMap.seats.set(seatNum, { booked: true, user: req.user });
    }
    
    // Save the updated seat map
    await seatMap.save();

    // Create a SINGLE booking record with all the seats
    // Note: You should update your Booking.js model to store an array
    const newBooking = new Booking({
      user: req.user,
      movie: movieId,
      seatNumber: seatNumbers.join(', '), // Keep this for backward compatibility or remove
      seatNumbers: seatNumbers, // Add this field to your Booking.js schema
      showTime
    });
    await newBooking.save();

    res.status(201).json({ message: "Booking successful", booking: newBooking });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET: Available Seats (No change needed)
router.get("/available-seats", async (req, res) => {
  try {
    const { movieId, showTime } = req.query;

    if (!movieId || !showTime) {
      return res.status(400).json({ message: "Missing movieId or showTime" });
    }

    let seatMap = await SeatMap.findOne({ movie: movieId, showTime });

    // Auto-create if missing
    if (!seatMap) {
      const seatData = {};
      for (let i = 1; i <= 30; i++) {
        seatData[`S${i}`] = { booked: false, user: null };
      }

      seatMap = new SeatMap({
        movie: movieId,
        showTime,
        seats: seatData
      });

      await seatMap.save();
    }

    // Get available seats
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