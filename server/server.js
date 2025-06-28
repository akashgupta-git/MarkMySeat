const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Route files
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookingRoutes");
const movieRoutes = require("./routes/movieRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); // ✅ Razorpay route

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);             // Auth (Register/Login)
app.use("/api/bookings", bookingRoutes);      // Booking Routes (Protected)
app.use("/api/movies", movieRoutes);          // Movie Routes
app.use("/api/payment", paymentRoutes);       // ✅ Razorpay Payment

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:");
    console.error(err.message);
  });

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
