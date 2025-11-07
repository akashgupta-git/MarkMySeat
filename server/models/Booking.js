const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    showTime: {
      type: String,
      required: true,
    },
    seatNumber: { // You can keep this or remove it
      type: String,
      required: false, // No longer the main field
    },
    seatNumbers: { // ✅ ADD THIS
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);