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
  showTimes: {
    type: [String],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);