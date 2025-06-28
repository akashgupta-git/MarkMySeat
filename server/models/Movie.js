const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  showTimes: {
    type: [String], // e.g., ["10:00 AM", "1:00 PM", "5:00 PM"]
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);
