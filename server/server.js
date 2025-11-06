const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const os = require("os");

dotenv.config();

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookingRoutes");
const movieRoutes = require("./routes/movieRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

const allowedOrigins = [
  "https://markmyseat.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS blocked request from:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const mongoStatus =
      dbState === 1
        ? "✅ Connected"
        : dbState === 2
        ? "⏳ Connecting"
        : dbState === 0
        ? "❌ Disconnected"
        : "⚠️ Unknown";

    res.status(200).json({
      status: "OK",
      service: "MarkMySeat Backend",
      environment: process.env.NODE_ENV || "development",
      mongo: mongoStatus,
      uptime: `${Math.round(process.uptime())}s`,
      hostname: os.hostname(),
    });
  } catch (err) {
    console.error("❌ Health check failed:", err.message);
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

app.get("/api/version", (req, res) => {
  const version = process.env.BUILD_VERSION || "v1.0.0";
  const buildTime = process.env.BUILD_TIME || new Date().toISOString();
  res.json({ version, buildTime });
});

app.get("/", (req, res) => {
  res.send("🎉 MarkMySeat API is live and ready!");
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err.message));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
