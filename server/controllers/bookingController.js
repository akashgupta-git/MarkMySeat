// server/controllers/bookingController.js
const Show = require("../models/Show");

exports.getAvailableSeats = async (req, res) => {
  try {
    const { movieId, showTime } = req.query;

    if (!movieId || !showTime) {
      return res.status(400).json({ msg: "Movie ID and Show Time required" });
    }

    const show = await Show.findOne({ movie: movieId, showTime });

    if (!show) {
      return res.status(404).json({ msg: "Show not found" });
    }

    const availableSeats = Object.keys(show.seatMap).filter(
      (seat) => !show.seatMap[seat].booked
    );

    res.json({ availableSeats });
  } catch (err) {
    console.error("Seat fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
