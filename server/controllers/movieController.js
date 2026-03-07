const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");

// Seed / admin helper — add a movie to the catalogue
const createMovie = async (req, res) => {
  try {
    const { title, showTimes } = req.body;

    const newMovie = new Movie({ title, showTimes });
    await newMovie.save();

    res.status(201).json({ message: "Movie added successfully", movie: newMovie });
  } catch (err) {
    console.error("Error creating movie:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Return the list of cities that actually have movies right now
// — powers the city selector dropdown on the frontend
const getCities = async (req, res) => {
  try {
    const movieTheatreIds = await Movie.find({ isActive: true, theatre: { $ne: null } }).distinct("theatre");
    const cities = await Theatre.find({
      _id: { $in: movieTheatreIds },
      isApproved: true,
      city: { $ne: "" },
    }).distinct("city");

    // normalise to title-case so "mumbai" and "Mumbai" don't show as two entries
    const seen = new Set();
    const normalised = [];
    for (const c of cities) {
      const key = c.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      normalised.push(c.trim().charAt(0).toUpperCase() + c.trim().slice(1).toLowerCase());
    }
    normalised.sort();

    res.status(200).json(normalised);
  } catch (err) {
    console.error("Error fetching cities:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// All active movies — pass ?city=Mumbai to filter by city
const getAllMovies = async (req, res) => {
  try {
    const filter = { isActive: true };
    const { city } = req.query;

    let movies = await Movie.find(filter)
      .populate("theatre", "name city address")
      .populate("screen", "name screenNumber");

    if (city) {
      movies = movies.filter(
        (m) => m.theatre?.city?.toLowerCase() === city.toLowerCase()
      );
    }

    res.status(200).json(movies);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Single movie by id — includes full theatre + screen details for the booking page
const getMovieById = async (req, res) => {
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
};

// Public list of all approved theatres (used in various dropdowns)
const getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find({ isApproved: true }).select("name city address screens logoUrl");
    res.status(200).json(theatres);
  } catch (err) {
    console.error("Error fetching theatres:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createMovie, getCities, getAllMovies, getMovieById, getTheatres };
