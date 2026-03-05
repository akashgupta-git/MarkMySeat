const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    screenNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    seatConfig: {
      rows: { type: Number, default: 8, min: 1, max: 26 },
      seatsPerRow: { type: Number, default: 12, min: 1, max: 30 },
      categories: [
        {
          name: { type: String, required: true },
          rows: [String],
          price: { type: Number, required: true },
          color: { type: String, default: "#8b5cf6" },
        },
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// make sure two screens in the same theatre can't share a number
screenSchema.index({ theatre: 1, screenNumber: 1 }, { unique: true });

module.exports = mongoose.model("Screen", screenSchema);