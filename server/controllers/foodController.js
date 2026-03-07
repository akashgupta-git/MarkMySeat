const FoodItem = require("../models/FoodItem");

// Public — list available food items, optionally filtered by theatre
const listFoodItems = async (req, res) => {
  try {
    const { theatre } = req.query;
    const filter = { isAvailable: true };
    if (theatre) {
      filter.$or = [{ theatre }, { theatre: null }];
      delete filter.isAvailable;
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
};

// Theatre-only — list food items belonging to this theatre
const getMyFoodItems = async (req, res) => {
  try {
    const items = await FoodItem.find({ theatre: req.theatre }).sort({ category: 1, name: 1 });
    res.status(200).json(items);
  } catch (err) {
    console.error("Theatre food list error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Theatre adds a new food/beverage item to their menu
const addFoodItem = async (req, res) => {
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
};

const updateFoodItem = async (req, res) => {
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
};

const deleteFoodItem = async (req, res) => {
  try {
    const item = await FoodItem.findOneAndDelete({ _id: req.params.id, theatre: req.theatre });
    if (!item) return res.status(404).json({ message: "Food item not found" });
    res.status(200).json({ message: "Food item deleted" });
  } catch (err) {
    console.error("Theatre delete food error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { listFoodItems, getMyFoodItems, addFoodItem, updateFoodItem, deleteFoodItem };