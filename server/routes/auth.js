const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware"); // ✅ 1. IMPORT MIDDLEWARE

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    
    // --- Log in user immediately after register ---
    // Generate token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1d" });

    // Send back token and user data (just like login)
    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
    // --- End auto-login ---
    
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      token,
      user: {
        id: user._id, // Send 'id' not '_id' to match register
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET CURRENT USER (for AuthContext)
// This is the new route you needed
router.get("/me", protect, async (req, res) => {
  try {
    // 'req.user' is attached by the 'protect' middleware
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/test", (req, res) => {
  res.json({ message: "Auth route working!" });
});

module.exports = router;