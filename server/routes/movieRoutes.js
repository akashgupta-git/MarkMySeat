const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");

// add a new movie (mainly for admin / seed purposes)
router.post("/create", async (req, res) => {
  try {
    const { title, showTimes } = req.body;

    const newMovie = new Movie({ title, showTimes });
    await newMovie.save();

    res.status(201).json({ message: "Movie added successfully", movie: newMovie });
  } catch (err) {
    console.error("Error creating movie:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// get all movies (only active ones)
router.get("/all", async (req, res) => {
  try {
    const filter = { isActive: true };
    const { city } = req.query;

    let movies = await Movie.find(filter)
      .populate("theatre", "name city")
      .populate("screen", "name screenNumber");

    // optional city filter
    if (city) {
      movies = movies.filter((m) => m.theatre?.city?.toLowerCase() === city.toLowerCase());
    }

    res.status(200).json(movies);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// get single movie by id
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate("theatre", "name city address seatConfig")
      .populate("screen");
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json(movie);
  } catch (err) {
    console.error("Error fetching movie:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /theatres — list all approved theatres
router.get("/info/theatres", async (req, res) => {
  try {
    const theatres = await Theatre.find({ isApproved: true }).select("name city address screens logoUrl");
    res.status(200).json(theatres);
  } catch (err) {
    console.error("Error fetching theatres:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;