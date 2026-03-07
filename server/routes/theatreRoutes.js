const express = require("express");
const router = express.Router();
const protectTheatre = require("../middleware/theatreMiddleware");
const theatreController = require("../controllers/theatreController");

// Screens
router.get("/screens", protectTheatre, theatreController.listScreens);
router.post("/screens", protectTheatre, theatreController.addScreen);
router.put("/screens/:id", protectTheatre, theatreController.updateScreen);
router.delete("/screens/:id", protectTheatre, theatreController.deleteScreen);

// Movies
router.post("/movies", protectTheatre, theatreController.addMovie);
router.get("/movies", protectTheatre, theatreController.listMovies);
router.put("/movies/:id", protectTheatre, theatreController.updateMovie);
router.delete("/movies/:id", protectTheatre, theatreController.deleteMovie);

// Bookings
router.get("/bookings", protectTheatre, theatreController.listBookings);
router.put("/bookings/:id/status", protectTheatre, theatreController.updateBookingStatus);

// Dashboard stats
router.get("/stats", protectTheatre, theatreController.getStats);

module.exports = router;