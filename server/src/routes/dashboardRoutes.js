    const express = require("express");

const requireAuth = require("../middleware/authMiddleware");

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

const router = express.Router();

router.use(requireAuth);

router.get("/stats", getDashboardStats);

module.exports = router;