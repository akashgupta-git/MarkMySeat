const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");

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

// get all movies
router.get("/all", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// get single movie by id
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json(movie);
  } catch (err) {
    console.error("Error fetching movie:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;