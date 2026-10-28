const express = require("express");

const {
  signup,
  login,
  getCurrentUser,
  logout,
} = require("../controllers/authController");

const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/me", requireAuth, getCurrentUser);

router.post("/logout", requireAuth, logout);

module.exports = router;