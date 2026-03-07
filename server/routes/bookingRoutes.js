const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const bookingController = require("../controllers/bookingController");

// User's own bookings
router.get("/my-bookings", protect, bookingController.getMyBookings);
router.get("/my-bookings/:id", protect, bookingController.getBookingById);
router.put("/my-bookings/:id/cancel", protect, bookingController.cancelBooking);

// Seat locking (Redis)
router.post("/lock-seats", protect, bookingController.lockSeatsHandler);
router.post("/unlock-seats", protect, bookingController.unlockSeatsHandler);

// Create booking (with MongoDB transaction + Redis lock verification)
router.post("/create", protect, bookingController.createBooking);

// Public — QR code ticket verification
router.get("/verify/:bookingId", bookingController.verifyBooking);

// Public — available seats for a show
router.get("/available-seats", bookingController.getAvailableSeats);

// Expose processBooking so BullMQ worker can call it from server.js
router._processBooking = bookingController.processBooking;

module.exports = router;