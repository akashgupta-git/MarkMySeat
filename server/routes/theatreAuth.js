const express = require("express");
const router = express.Router();
const protectTheatre = require("../middleware/theatreMiddleware");
const theatreAuthController = require("../controllers/theatreAuthController");

// Theatre authentication & profile
router.post("/register", theatreAuthController.register);
router.post("/login", theatreAuthController.login);
router.get("/me", protectTheatre, theatreAuthController.getMe);
router.put("/profile", protectTheatre, theatreAuthController.updateProfile);
router.put("/seat-config", protectTheatre, theatreAuthController.updateSeatConfig);

module.exports = router;