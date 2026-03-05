const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

// standalone helper to connect to mongo — not actually used in server.js right now,
// but keeping it around in case we want to split things up later
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;