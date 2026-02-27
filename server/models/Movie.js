const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  posterUrl: {
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
    type: String,
    required: false,
  },
  releaseDate: {
    type: Date,
    required: false,
  },
  rating: {
    type: String,
    default: "",
  },
  cast: {
    type: String,
    default: "",
  },
  showTimes: {
    type: [String],
    required: true,
  },
  // theatre that manages this listing (null = seeded / system movie)
  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theatre",
    default: null,
  },
  // screen within the theatre (null = legacy / system movie)
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Screen",
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);