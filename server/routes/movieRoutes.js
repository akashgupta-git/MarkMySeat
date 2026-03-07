const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

// Public movie endpoints
router.post("/create", movieController.createMovie);
router.get("/cities", movieController.getCities);
router.get("/all", movieController.getAllMovies);
router.get("/info/theatres", movieController.getTheatres);
router.get("/:id", movieController.getMovieById);

module.exports = router;