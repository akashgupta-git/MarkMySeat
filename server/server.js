const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const os = require("os");

dotenv.config();

// route imports
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookingRoutes");
const movieRoutes = require("./routes/movieRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// only allow our frontend origins (netlify prod + local dev)
const allowedOrigins = [
  "https://markmyseat.netlify.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like server-to-server or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/payment", paymentRoutes);

// quick health check endpoint - useful for monitoring on render
app.get("/api/health", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const statusMap = { 0: "disconnected", 1: "connected", 2: "connecting" };
    const mongoStatus = statusMap[dbState] || "unknown";

    res.status(200).json({
      status: "OK",
      service: "MarkMySeat Backend",
      environment: process.env.NODE_ENV || "development",
      mongo: mongoStatus,
      uptime: `${Math.round(process.uptime())}s`,
      hostname: os.hostname(),
    });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

// version endpoint (handy for debugging deploys)
app.get("/api/version", (req, res) => {
  const version = process.env.BUILD_VERSION || "v1.0.0";
  const buildTime = process.env.BUILD_TIME || new Date().toISOString();
  res.json({ version, buildTime });
});

// root route - just so we know it's alive
app.get("/", (req, res) => {
  res.send("MarkMySeat API is live");
});

// connect to mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));