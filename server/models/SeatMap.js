const mongoose = require("mongoose");

const seatMapSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  showTime: {
    type: String,
    required: true,
  },
  seats: {
    type: Map,
    of: {
      booked: Boolean,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    },
    default: {}
  }
}, { timestamps: true });

seatMapSchema.index({ movie: 1, showTime: 1 }, { unique: true });

module.exports = mongoose.model("SeatMap", seatMapSchema);