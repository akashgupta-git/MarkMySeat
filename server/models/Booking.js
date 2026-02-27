const mongoose = require("mongoose");

// generates a short unique booking ID like MMS-20260228-A3F7
function generateBookingId() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MMS-${y}${m}${d}-${rand}`;
}

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      default: generateBookingId,
    },
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
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      default: null,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      default: null,
    },
    screenName: {
      type: String,
      default: "",
    },
    showDate: {
      type: String,
      default: "",
    },
    showTime: {
      type: String,
      required: true,
    },
    seatNumber: {
      type: String,
      required: false,
    },
    seatNumbers: {
      type: [String],
      required: true,
    },
    // food / beverage add-ons
    foodOrders: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" },
        name: String,
        quantity: { type: Number, default: 1 },
        price: Number,
      },
    ],
    foodTotal: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    paymentId: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      default: "Razorpay",
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "used"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);