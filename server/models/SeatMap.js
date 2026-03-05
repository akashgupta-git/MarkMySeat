const mongoose = require("mongoose");

const seatMapSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Screen",
    default: null,
  },
  showDate: {
    type: String,
    default: "",
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

// one seat map per movie + screen + date + time combination
seatMapSchema.index({ movie: 1, screen: 1, showDate: 1, showTime: 1 }, { unique: true });

module.exports = mongoose.model("SeatMap", seatMapSchema);
