const express = require("express");
const router = express.Router();
const protectTheatre = require("../middleware/theatreMiddleware");
const foodController = require("../controllers/foodController");

// Public
router.get("/", foodController.listFoodItems);

// Theatre-only
router.get("/my", protectTheatre, foodController.getMyFoodItems);
router.post("/", protectTheatre, foodController.addFoodItem);
router.put("/:id", protectTheatre, foodController.updateFoodItem);
router.delete("/:id", protectTheatre, foodController.deleteFoodItem);

module.exports = router;