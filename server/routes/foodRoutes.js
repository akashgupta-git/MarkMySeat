const express = require("express");
const router = express.Router();
const FoodItem = require("../models/FoodItem");
const protectTheatre = require("../middleware/theatreMiddleware");

// ──────── Public ────────

// GET / — list available food items (optionally filter by theatre)
router.get("/", async (req, res) => {
  try {
    const { theatre } = req.query;
    // if theatre specified, get theatre-specific + global items; else get global only
    const filter = { isAvailable: true };
    if (theatre) {
      filter.$or = [{ theatre }, { theatre: null }];
      delete filter.isAvailable; // show all for filtering
      Object.assign(filter, { isAvailable: true, $or: [{ theatre }, { theatre: null }] });
    } else {
      filter.theatre = null;
    }

    const items = await FoodItem.find(filter).sort({ category: 1, name: 1 });
    res.status(200).json(items);
  } catch (err) {
    console.error("Food list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ──────── Theatre-only ────────

// GET /my — food items belonging to this theatre
router.get("/my", protectTheatre, async (req, res) => {
  try {
    const items = await FoodItem.find({ theatre: req.theatre }).sort({ category: 1, name: 1 });
    res.status(200).json(items);
  } catch (err) {
    console.error("Theatre food list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST / — theatre adds a food item
router.post("/", protectTheatre, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, isVeg } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price required" });
    }

    const item = new FoodItem({
      name,
      description: description || "",
      price,
      category: category || "Snack",
      imageUrl: imageUrl || "",
      isVeg: isVeg !== undefined ? isVeg : true,
      theatre: req.theatre,
    });
    await item.save();

    res.status(201).json({ message: "Food item added", item });
  } catch (err) {
    console.error("Theatre add food error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /:id — update a food item
router.put("/:id", protectTheatre, async (req, res) => {
  try {
    const item = await FoodItem.findOne({ _id: req.params.id, theatre: req.theatre });
    if (!item) return res.status(404).json({ message: "Food item not found" });

    const fields = ["name", "description", "price", "category", "imageUrl", "isVeg", "isAvailable"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    await item.save();
    res.status(200).json({ message: "Food item updated", item });
  } catch (err) {
    console.error("Theatre update food error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /:id — remove a food item
router.delete("/:id", protectTheatre, async (req, res) => {
  try {
    const item = await FoodItem.findOneAndDelete({ _id: req.params.id, theatre: req.theatre });
    if (!item) return res.status(404).json({ message: "Food item not found" });
    res.status(200).json({ message: "Food item deleted" });
  } catch (err) {
    console.error("Theatre delete food error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
