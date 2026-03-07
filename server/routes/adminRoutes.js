const express = require("express");
const router = express.Router();
const protectAdmin = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

// Auth
router.post("/login", adminController.login);
router.get("/me", protectAdmin, adminController.getMe);

// Dashboard
router.get("/stats", protectAdmin, adminController.getStats);

// Users
router.get("/users", protectAdmin, adminController.listUsers);
router.put("/users/:id", protectAdmin, adminController.updateUser);
router.delete("/users/:id", protectAdmin, adminController.deleteUser);

// Theatres
router.get("/theatres", protectAdmin, adminController.listTheatres);
router.put("/theatres/:id", protectAdmin, adminController.updateTheatre);
router.delete("/theatres/:id", protectAdmin, adminController.deleteTheatre);
router.get("/theatres/:id/screens", protectAdmin, adminController.listTheatreScreens);

// Bookings
router.get("/bookings", protectAdmin, adminController.listBookings);
router.put("/bookings/:id/status", protectAdmin, adminController.updateBookingStatus);

// Movies
router.get("/movies", protectAdmin, adminController.listMovies);
router.put("/movies/:id", protectAdmin, adminController.updateMovie);

module.exports = router;