const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const SeatMap = require("../models/SeatMap");
const Movie = require("../models/Movie");

// ✅ GET: My Bookings
router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user }).populate("movie", "title");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST: Create Booking
router.post("/create", protect, async (req, res) => {
  try {
    const { movieId, seatNumber, showTime } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    let seatMap = await SeatMap.findOne({ movie: movieId, showTime });

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

    const seat = seatMap.seats.get(seatNumber);
    if (!seat) return res.status(404).json({ message: "Seat not found" });
    if (seat.booked) return res.status(400).json({ message: "Seat already booked" });

    seatMap.seats.set(seatNumber, { booked: true, user: req.user });
    await seatMap.save();

    const newBooking = new Booking({
      user: req.user,
      movie: movieId,
      seatNumber,
      showTime
    });
    await newBooking.save();

    res.status(201).json({ message: "Booking successful", booking: newBooking });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET: Available Seats (Auto-create seat map if not found)
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
