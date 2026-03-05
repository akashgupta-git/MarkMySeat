const mongoose = require("mongoose");

const showSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Show", showSchema);