const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["Popcorn", "Beverage", "Snack", "Combo", "Meal"],
      default: "Snack",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // which theatre sells this item (null means it's on the default/global menu)
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FoodItem", foodItemSchema);