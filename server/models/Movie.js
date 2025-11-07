const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  posterUrl: { // This field must match your seed file
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  genre: {
    type: String,
    required: false,
  },
  language: {
    type: String,
    required: false,
  },
  duration: {
    type: String, // e.g., "2h 30min"
    required: false,
  },
  releaseDate: {
    type: Date,
    required: false,
  },
  showTimes: {
    type: [String], // e.g., ["10:00 AM", "1:00 PM", "5:00 PM"]
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);