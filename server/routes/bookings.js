// server/controllers/bookingController.js
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const SeatMap = require('../models/SeatMap');

exports.createBooking = async (req, res) => {
  try {
    const { showId, selectedSeats } = req.body;
    const userId = req.user.id;

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found" });

    const seatMap = await SeatMap.findById(show.seatMap);
    if (!seatMap) return res.status(404).json({ message: "Seat map not found" });

    const alreadyBooked = selectedSeats.some(seat => seatMap.bookedSeats.includes(seat));
    if (alreadyBooked) {
      return res.status(400).json({ message: "One or more seats already booked" });
    }

    seatMap.bookedSeats.push(...selectedSeats);
    await seatMap.save();

    const booking = await Booking.create({
      user: userId,
      show: showId,
      seats: selectedSeats,
    });

    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'show',
        populate: { path: 'movie' },
      });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Fetching bookings failed:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
