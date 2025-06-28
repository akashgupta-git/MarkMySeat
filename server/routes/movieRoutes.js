const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");

// ✅ POST: Add a new movie (admin usage)
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

// ✅ GET: List all movies with showtimes
router.get("/all", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
