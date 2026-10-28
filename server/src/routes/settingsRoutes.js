const express = require("express");

const requireAuth = require("../middleware/authMiddleware");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const router = express.Router();

// All settings routes require authentication
router.use(requireAuth);

router.get("/", getSettings);

router.put("/", updateSettings);

module.exports = router;