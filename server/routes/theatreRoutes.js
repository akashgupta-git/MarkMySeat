const express = require("express");
const router = express.Router();
const protectTheatre = require("../middleware/theatreMiddleware");
const Movie = require("../models/Movie");
const Booking = require("../models/Booking");
const SeatMap = require("../models/SeatMap");
const Screen = require("../models/Screen");
const Theatre = require("../models/Theatre");

// ──────────────────────── Screen Management ────────────────────────

// GET /screens — list all screens for this theatre
router.get("/screens", protectTheatre, async (req, res) => {
  try {
    const screens = await Screen.find({ theatre: req.theatre }).sort({ screenNumber: 1 });
    res.status(200).json(screens);
  } catch (err) {
    console.error("Theatre list screens error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /screens — add a new screen
router.post("/screens", protectTheatre, async (req, res) => {
  try {
    const { name, screenNumber, seatConfig } = req.body;
    if (!name || !screenNumber) {
      return res.status(400).json({ message: "Screen name and number are required" });
    }

    // check for duplicate screen number
    const existing = await Screen.findOne({ theatre: req.theatre, screenNumber });
    if (existing) {
      return res.status(400).json({ message: `Screen ${screenNumber} already exists` });
    }

    const defaultCategories = [
      { name: "Premium", rows: ["A", "B"], price: 350, color: "#eab308" },
      { name: "Executive", rows: ["C", "D", "E"], price: 250, color: "#0ea5e9" },
      { name: "Classic", rows: ["F", "G", "H"], price: 150, color: "#22c55e" },
    ];

    const screen = new Screen({
      theatre: req.theatre,
      name,
      screenNumber,
      seatConfig: seatConfig || {
        rows: 8,
        seatsPerRow: 12,
        categories: defaultCategories,
      },
    });
    await screen.save();

    // update theatre screen count
    const count = await Screen.countDocuments({ theatre: req.theatre });
    await Theatre.findByIdAndUpdate(req.theatre, { screens: count });

    res.status(201).json({ message: "Screen added", screen });
  } catch (err) {
    console.error("Theatre add screen error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /screens/:id — update a screen
router.put("/screens/:id", protectTheatre, async (req, res) => {
  try {
    const screen = await Screen.findOne({ _id: req.params.id, theatre: req.theatre });
    if (!screen) return res.status(404).json({ message: "Screen not found" });

    const fields = ["name", "screenNumber", "seatConfig", "isActive"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) screen[f] = req.body[f];
    });

    screen.markModified("seatConfig");
    await screen.save();
    res.status(200).json({ message: "Screen updated", screen });
  } catch (err) {
    console.error("Theatre update screen error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /screens/:id — remove a screen
router.delete("/screens/:id", protectTheatre, async (req, res) => {
  try {
    // check for movies assigned to this screen
    const assigned = await Movie.countDocuments({ screen: req.params.id, isActive: true });
    if (assigned > 0) {
      return res.status(400).json({ message: "Cannot delete — screen has active movies. Remove or reassign them first." });
    }

    const screen = await Screen.findOneAndDelete({ _id: req.params.id, theatre: req.theatre });
    if (!screen) return res.status(404).json({ message: "Screen not found" });

    // update theatre screen count
    const count = await Screen.countDocuments({ theatre: req.theatre });
    await Theatre.findByIdAndUpdate(req.theatre, { screens: count });

    res.status(200).json({ message: "Screen deleted" });
  } catch (err) {
    console.error("Theatre delete screen error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────── Movie Management ────────────────────────

// POST /movies — theatre adds a movie to their listing
router.post("/movies", protectTheatre, async (req, res) => {
  try {
    const {
      title, posterUrl, description, genre, language,
      duration, releaseDate, showTimes, rating, cast, screen,
    } = req.body;

    if (!title || !showTimes || showTimes.length === 0) {
      return res.status(400).json({ message: "Title and at least one showtime required" });
    }

    // validate screen belongs to this theatre if provided
    if (screen) {
      const screenDoc = await Screen.findOne({ _id: screen, theatre: req.theatre });
      if (!screenDoc) return res.status(400).json({ message: "Invalid screen" });
    }

    const movie = new Movie({
      title,
      posterUrl: posterUrl || "",
      description: description || "",
      genre: genre || "",
      language: language || "",
      duration: duration || "",
      releaseDate: releaseDate || null,
      showTimes,
      rating: rating || "",
      cast: cast || "",
      theatre: req.theatre,
      screen: screen || null,
      isActive: true,
    });
    await movie.save();

    res.status(201).json({ message: "Movie added", movie });
  } catch (err) {
    console.error("Theatre add movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /movies — list all movies owned by this theatre
router.get("/movies", protectTheatre, async (req, res) => {
  try {
    const movies = await Movie.find({ theatre: req.theatre })
      .populate("screen", "name screenNumber")
      .sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (err) {
    console.error("Theatre list movies error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /movies/:id — update a movie
router.put("/movies/:id", protectTheatre, async (req, res) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, theatre: req.theatre });
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const fields = [
      "title", "posterUrl", "description", "genre", "language",
      "duration", "releaseDate", "showTimes", "rating", "cast", "isActive", "screen",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) movie[f] = req.body[f];
    });

    await movie.save();
    res.status(200).json({ message: "Movie updated", movie });
  } catch (err) {
    console.error("Theatre update movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /movies/:id — remove a movie listing
router.delete("/movies/:id", protectTheatre, async (req, res) => {
  try {
    const movie = await Movie.findOneAndDelete({ _id: req.params.id, theatre: req.theatre });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.status(200).json({ message: "Movie deleted" });
  } catch (err) {
    console.error("Theatre delete movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────── Booking Management ────────────────────────

// GET /bookings — all bookings for this theatre's movies
router.get("/bookings", protectTheatre, async (req, res) => {
  try {
    // find all movies for this theatre
    const movieIds = await Movie.find({ theatre: req.theatre }).distinct("_id");

    const bookings = await Booking.find({ movie: { $in: movieIds } })
      .populate("user", "name email phone")
      .populate("movie", "title posterUrl genre language duration")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Theatre bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /bookings/:id/status — mark a booking as used/cancelled
router.put("/bookings/:id/status", protectTheatre, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "cancelled", "used"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id).populate("movie");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // verify this booking belongs to one of the theatre's movies
    const movie = await Movie.findOne({ _id: booking.movie._id, theatre: req.theatre });
    if (!movie) return res.status(403).json({ message: "Not your booking" });

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    console.error("Theatre booking status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────── Dashboard Stats ────────────────────────

// GET /stats — quick overview for dashboard
router.get("/stats", protectTheatre, async (req, res) => {
  try {
    const movieIds = await Movie.find({ theatre: req.theatre }).distinct("_id");
    const totalMovies = movieIds.length;

    const totalBookings = await Booking.countDocuments({
      movie: { $in: movieIds },
      status: { $ne: "cancelled" },
    });

    const revenueAgg = await Booking.aggregate([
      { $match: { movie: { $in: movieIds }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, foodTotal: { $sum: "$foodTotal" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const totalFoodRevenue = revenueAgg[0]?.foodTotal || 0;

    // recent bookings
    const recentBookings = await Booking.find({ movie: { $in: movieIds } })
      .populate("user", "name email")
      .populate("movie", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalMovies,
      totalBookings,
      totalRevenue,
      totalFoodRevenue,
      recentBookings,
    });
  } catch (err) {
    console.error("Theatre stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
