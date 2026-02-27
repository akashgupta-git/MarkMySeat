const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

// standalone db connector - not used in server.js rn but keeping it
// in case we want to separate concerns later
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