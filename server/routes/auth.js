const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// User authentication routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, authController.updateProfile);
router.put("/change-password", protect, authController.changePassword);

// quick smoke-test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

module.exports = router;