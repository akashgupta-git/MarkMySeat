const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Theatre = require("../models/Theatre");
const Screen = require("../models/Screen");

const JWT_SECRET = process.env.JWT_SECRET;

const DEFAULT_SEAT_CATEGORIES = [
  { name: "Premium", rows: ["A", "B"], price: 350, color: "#eab308" },
  { name: "Executive", rows: ["C", "D", "E"], price: 250, color: "#0ea5e9" },
  { name: "Classic", rows: ["F", "G", "H"], price: 150, color: "#22c55e" },
];

// Register a new theatre and auto-create its default screens
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, city, screens } = req.body;

    const existing = await Theatre.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Theatre with this email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const screenCount = Math.max(1, parseInt(screens) || 1);

    const newTheatre = new Theatre({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
      city: city || "",
      screens: screenCount,
      seatConfig: {
        rows: 8,
        seatsPerRow: 12,
        categories: DEFAULT_SEAT_CATEGORIES,
      },
    });
    await newTheatre.save();

    // spin up default screens matching the count they requested
    for (let i = 1; i <= screenCount; i++) {
      await new Screen({
        theatre: newTheatre._id,
        name: `Screen ${i}`,
        screenNumber: i,
        seatConfig: {
          rows: 8,
          seatsPerRow: 12,
          categories: DEFAULT_SEAT_CATEGORIES,
        },
      }).save();
    }

    const token = jwt.sign(
      { id: newTheatre._id, role: "theatre" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Theatre registered successfully!",
      token,
      theatre: {
        _id: newTheatre._id,
        name: newTheatre.name,
        email: newTheatre.email,
        city: newTheatre.city,
      },
    });
  } catch (err) {
    console.error("Theatre register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Authenticate a theatre owner — checks approval status too
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const theatre = await Theatre.findOne({ email });
    if (!theatre)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, theatre.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!theatre.isApproved)
      return res.status(403).json({ message: "Your theatre is pending approval" });

    const token = jwt.sign(
      { id: theatre._id, role: "theatre" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      theatre: {
        _id: theatre._id,
        name: theatre.name,
        email: theatre.email,
        city: theatre.city,
      },
    });
  } catch (err) {
    console.error("Theatre login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Return the current theatre's full profile (sans password)
const getMe = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.theatre).select("-password");
    if (!theatre) return res.status(404).json({ message: "Theatre not found" });
    res.status(200).json(theatre);
  } catch (err) {
    console.error("Theatre /me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update basic theatre profile fields
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, screens, logoUrl } = req.body;
    const theatre = await Theatre.findById(req.theatre);
    if (!theatre) return res.status(404).json({ message: "Theatre not found" });

    if (name) theatre.name = name;
    if (phone !== undefined) theatre.phone = phone;
    if (address !== undefined) theatre.address = address;
    if (city !== undefined) theatre.city = city;
    if (screens) theatre.screens = screens;
    if (logoUrl !== undefined) theatre.logoUrl = logoUrl;

    await theatre.save();
    const updated = await Theatre.findById(req.theatre).select("-password");
    res.status(200).json(updated);
  } catch (err) {
    console.error("Theatre profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Tweak the seat layout — rows, seats per row, and category pricing/colors
const updateSeatConfig = async (req, res) => {
  try {
    const { rows, seatsPerRow, categories } = req.body;
    const theatre = await Theatre.findById(req.theatre);
    if (!theatre) return res.status(404).json({ message: "Theatre not found" });

    if (rows) theatre.seatConfig.rows = rows;
    if (seatsPerRow) theatre.seatConfig.seatsPerRow = seatsPerRow;
    if (categories && Array.isArray(categories)) {
      theatre.seatConfig.categories = categories;
    }

    theatre.markModified("seatConfig");
    await theatre.save();
    const updated = await Theatre.findById(req.theatre).select("-password");
    res.status(200).json(updated);
  } catch (err) {
    console.error("Seat config update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, getMe, updateProfile, updateSeatConfig };
