const express = require("express");
const router = express.Router();
const Show = require("../models/Show");

// get all shows (sorted newest first)
router.get("/", async (req, res) => {
  try {
    const shows = await Show.find().sort({ createdAt: -1 });
    res.status(200).json(shows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shows" });
  }
});

// add a new show (admin)
router.post("/", async (req, res) => {
  try {
    const { title, time, location } = req.body;

    if (!title || !time || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newShow = new Show({ title, time, location });
    await newShow.save();

    res.status(201).json({ message: "Show added successfully", show: newShow });
  } catch (err) {
    console.error("Error adding show:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
