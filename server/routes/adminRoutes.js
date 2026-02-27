const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const protectAdmin = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Theatre = require("../models/Theatre");
const Movie = require("../models/Movie");
const Booking = require("../models/Booking");
const Screen = require("../models/Screen");
const FoodItem = require("../models/FoodItem");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// ──────────────────────── Auth ────────────────────────

// POST /login — admin sign in
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      admin: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /me — current admin info
router.get("/me", protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.admin).select("-password");
    if (!user || user.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Admin /me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────── Dashboard Stats ────────────────────────

router.get("/stats", protectAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalTheatres = await Theatre.countDocuments();
    const approvedTheatres = await Theatre.countDocuments({ isApproved: true });
    const totalMovies = await Movie.countDocuments({ isActive: true });
    const totalScreens = await Screen.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: "confirmed" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });

    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalFoodRevenue: { $sum: "$foodTotal" },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalFoodRevenue = revenueAgg[0]?.totalFoodRevenue || 0;

    // recent bookings
    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("movie", "title posterUrl")
      .sort({ createdAt: -1 })
      .limit(10);

    // new users this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: monthStart },
    });

    res.status(200).json({
      totalUsers,
      totalTheatres,
      approvedTheatres,
      totalMovies,
      totalScreens,
      totalBookings,
      activeBookings,
      cancelledBookings,
      totalRevenue,
      totalFoodRevenue,
      newUsersThisMonth,
      recentBookings,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────── User Management ────────────────────────

// GET /users — list all users
router.get("/users", protectAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error("Admin list users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /users/:id — update user (toggle active, change role)
router.put("/users/:id", protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // don't let admin disable themselves
    if (user._id.toString() === req.admin && req.body.isActive === false) {
      return res.status(400).json({ message: "Cannot disable your own account" });
    }

    const fields = ["isActive", "role", "name", "email"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });

    await user.save();
    const updated = await User.findById(req.params.id).select("-password");
    res.status(200).json(updated);
  } catch (err) {
    console.error("Admin update user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /users/:id — delete a user
router.delete("/users/:id", protectAdmin, async (req, res) => {
  try {
    if (req.params.id === req.admin) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────── Theatre Management ────────────────────────

// GET /theatres — list all theatres
router.get("/theatres", protectAdmin, async (req, res) => {
  try {
    const theatres = await Theatre.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(theatres);
  } catch (err) {
    console.error("Admin list theatres error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /theatres/:id — update theatre (approve/disable etc.)
router.put("/theatres/:id", protectAdmin, async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ message: "Theatre not found" });

    const fields = ["isApproved", "name", "city", "address", "phone"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) theatre[f] = req.body[f];
    });

    await theatre.save();
    const updated = await Theatre.findById(req.params.id).select("-password");
    res.status(200).json(updated);
  } catch (err) {
    console.error("Admin update theatre error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /theatres/:id — delete a theatre and all its data
router.delete("/theatres/:id", protectAdmin, async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) return res.status(404).json({ message: "Theatre not found" });

    // cascade delete screens, movies, food items
    await Screen.deleteMany({ theatre: req.params.id });
    await Movie.deleteMany({ theatre: req.params.id });
    await FoodItem.deleteMany({ theatre: req.params.id });

    res.status(200).json({ message: "Theatre and all associated data deleted" });
  } catch (err) {
    console.error("Admin delete theatre error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /theatres/:id/screens — list screens for a specific theatre
router.get("/theatres/:id/screens", protectAdmin, async (req, res) => {
  try {
    const screens = await Screen.find({ theatre: req.params.id }).sort({
      screenNumber: 1,
    });
    res.status(200).json(screens);
  } catch (err) {
    console.error("Admin list theatre screens error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────── Booking Management ────────────────────────

// GET /bookings — list all bookings system-wide
router.get("/bookings", protectAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("movie", "title posterUrl genre language duration")
      .populate("theatre", "name city")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Admin list bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /bookings/:id/status — update booking status
router.put("/bookings/:id/status", protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "cancelled", "used"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    console.error("Admin update booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────── Movie Oversight ────────────────────────

// GET /movies — all movies system-wide
router.get("/movies", protectAdmin, async (req, res) => {
  try {
    const movies = await Movie.find()
      .populate("theatre", "name city")
      .populate("screen", "name screenNumber")
      .sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (err) {
    console.error("Admin list movies error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /movies/:id — toggle movie active status
router.put("/movies/:id", protectAdmin, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    if (req.body.isActive !== undefined) movie.isActive = req.body.isActive;
    await movie.save();

    res.status(200).json({ message: "Movie updated", movie });
  } catch (err) {
    console.error("Admin update movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
