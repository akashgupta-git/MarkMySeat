const mongoose = require("mongoose");

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    // number of screens this theatre has
    screens: {
      type: Number,
      default: 1,
      min: 1,
    },
    // custom seat layout config per screen  
    // e.g. { rows: 8, seatsPerRow: 12, categories: [...] }
    seatConfig: {
      rows: { type: Number, default: 8, min: 1, max: 26 },
      seatsPerRow: { type: Number, default: 12, min: 1, max: 30 },
      categories: [
        {
          name: { type: String, required: true }, // e.g. "Premium"
          rows: [String], // e.g. ["A", "B"]
          price: { type: Number, required: true },
          color: { type: String, default: "#eab308" }, // tailwind color hex
        },
      ],
    },
    isApproved: {
      type: Boolean,
      default: true, // auto-approve for now; set false for admin review flow
    },
    logoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theatre", theatreSchema);
