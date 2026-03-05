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
const theatreAuthRoutes = require("./routes/theatreAuth");
const theatreRoutes = require("./routes/theatreRoutes");
const foodRoutes = require("./routes/foodRoutes");
const adminRoutes = require("./routes/adminRoutes");

// seat locking needs redis + bullmq
const { getRedis, isRedisReady } = require("./config/redis");
const { initBookingQueue } = require("./services/bookingQueue");

const app = express();

// only let requests from our own frontend through (netlify prod + localhost dev)
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
app.use("/api/theatre/auth", theatreAuthRoutes);
app.use("/api/theatre", theatreRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/admin", adminRoutes);

// simple health check — handy for uptime monitoring on Render
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

// version info so we know which build is deployed
app.get("/api/version", (req, res) => {
  const version = process.env.BUILD_VERSION || "v1.0.0";
  const buildTime = process.env.BUILD_TIME || new Date().toISOString();
  res.json({ version, buildTime });
});

// sanity check — just confirms the API is alive
app.get("/", (req, res) => {
  res.send("MarkMySeat API is live");
});

// fire up mongo, then redis, then the booking queue
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // initialise Redis (starts connecting in background)
    const redis = getRedis();
    if (redis) {
      // Wait for Redis to be ready, then init BullMQ
      redis.on("ready", () => {
        initBookingQueue(bookingRoutes._processBooking);
      });
      // If already ready (unlikely but safe)
      if (isRedisReady()) {
        initBookingQueue(bookingRoutes._processBooking);
      }
    }
  })
  .catch((err) => console.error("MongoDB connection failed:", err.message));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));