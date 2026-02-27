const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const SeatMap = require("../models/SeatMap");
const Movie = require("../models/Movie");
const Screen = require("../models/Screen");

// helper to generate a seat layout based on screen config (or default 8x12)
function generateSeats(seatConfig) {
  const seatData = {};
  const totalRows = seatConfig?.rows || 8;
  const seatsPerRow = seatConfig?.seatsPerRow || 12;
  for (let r = 0; r < totalRows; r++) {
    const rowLetter = String.fromCharCode(65 + r); // A, B, C...
    for (let i = 1; i <= seatsPerRow; i++) {
      seatData[`${rowLetter}${i}`] = { booked: false, user: null };
    }
  }
  return seatData;
}

// get today's date as YYYY-MM-DD string
function todayDate() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// get all bookings for the currently logged in user
router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user })
      .populate("movie", "title posterUrl genre language duration")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// get a single booking by its mongo _id
router.get("/my-bookings/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user })
      .populate("movie", "title posterUrl genre language duration");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// cancel a booking (user self-service)
router.put("/my-bookings/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: `Cannot cancel — booking is already ${booking.status}` });
    }

    // free the seats back
    const screenId = booking.screen || null;
    const showDate = booking.showDate || "";
    const seatMap = await SeatMap.findOne({
      movie: booking.movie,
      screen: screenId,
      showDate,
      showTime: booking.showTime,
    });

    if (seatMap) {
      for (const seatNum of booking.seatNumbers) {
        const seat = seatMap.seats.get(seatNum);
        if (seat) {
          seatMap.seats.set(seatNum, { booked: false, user: null });
        }
      }
      seatMap.markModified("seats");
      await seatMap.save();
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// create a new booking with multiple seats
router.post("/create", protect, async (req, res) => {
  try {
    const { movieId, seatNumbers, showTime, showDate, totalPrice, paymentId, foodOrders, foodTotal } = req.body;

    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: "Seat numbers must be a non-empty array" });
    }

    const movie = await Movie.findById(movieId).populate("screen");
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const screenId = movie.screen?._id || null;
    const screenName = movie.screen?.name || "";
    const seatConfig = movie.screen?.seatConfig || null;
    const dateStr = showDate || todayDate();

    let seatMap = await SeatMap.findOne({ movie: movieId, screen: screenId, showDate: dateStr, showTime });

    // lazily create the seat map on first booking for this show
    if (!seatMap) {
      seatMap = new SeatMap({
        movie: movieId,
        screen: screenId,
        showDate: dateStr,
        showTime,
        seats: generateSeats(seatConfig),
      });
    }

    // validate all seats first before marking any as booked
    for (const seatNum of seatNumbers) {
      const seat = seatMap.seats.get(seatNum);
      if (!seat) return res.status(404).json({ message: `Seat ${seatNum} not found` });
      if (seat.booked) return res.status(400).json({ message: `Seat ${seatNum} is already booked` });
    }

    // mark them booked
    for (const seatNum of seatNumbers) {
      seatMap.seats.set(seatNum, { booked: true, user: req.user });
    }
    await seatMap.save();

    // store one booking record for all the seats together
    const newBooking = new Booking({
      user: req.user,
      movie: movieId,
      theatre: movie.theatre || null,
      screen: screenId,
      screenName,
      showDate: dateStr,
      seatNumber: seatNumbers.join(', '),
      seatNumbers: seatNumbers,
      showTime,
      totalPrice: totalPrice || 0,
      paymentId: paymentId || "",
      foodOrders: foodOrders || [],
      foodTotal: foodTotal || 0,
    });
    await newBooking.save();

    res.status(201).json({ message: "Booking successful", booking: newBooking });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUBLIC — verify a booking by bookingId (for QR code scanning)
router.get("/verify/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate("movie", "title posterUrl genre language duration")
      .populate("user", "name");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({
      valid: true,
      bookingId: booking.bookingId,
      status: booking.status || "confirmed",
      movie: booking.movie?.title || "Unknown",
      posterUrl: booking.movie?.posterUrl || "",
      genre: booking.movie?.genre || "",
      language: booking.movie?.language || "",
      duration: booking.movie?.duration || "",
      showTime: booking.showTime,
      showDate: booking.showDate || "",
      screenName: booking.screenName || "",
      seats: booking.seatNumbers,
      ticketCount: booking.seatNumbers.length,
      customerName: booking.user?.name || "Guest",
      totalPrice: booking.totalPrice || 0,
      foodTotal: booking.foodTotal || 0,
      bookedAt: booking.createdAt,
    });
  } catch (err) {
    console.error("Verify booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// returns which seats are still available for a given movie + showtime
router.get("/available-seats", async (req, res) => {
  try {
    const { movieId, showTime, showDate } = req.query;

    if (!movieId || !showTime) {
      return res.status(400).json({ message: "Missing movieId or showTime" });
    }

    const movie = await Movie.findById(movieId).populate("screen");
    const screenId = movie?.screen?._id || null;
    const seatConfig = movie?.screen?.seatConfig || null;
    const dateStr = showDate || todayDate();

    let seatMap = await SeatMap.findOne({ movie: movieId, screen: screenId, showDate: dateStr, showTime });

    // create layout based on screen config if no one has booked for this show yet
    if (!seatMap) {
      seatMap = new SeatMap({
        movie: movieId,
        screen: screenId,
        showDate: dateStr,
        showTime,
        seats: generateSeats(seatConfig),
      });
      await seatMap.save();
    }

    // collect seats that aren't booked
    const availableSeats = [];
    for (const [seatNum, data] of seatMap.seats.entries()) {
      if (!data.booked) availableSeats.push(seatNum);
    }

    res.status(200).json({ availableSeats });

  } catch (err) {
    console.error("Fetching seats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;