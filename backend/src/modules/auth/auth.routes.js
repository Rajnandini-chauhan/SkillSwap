const express = require("express");
const router = express.Router();
const { registerRules, loginRules, validate } = require("./auth.validation");
const { register, login, logout, getMe, refreshToken } = require("./auth.controller");
const { protect } = require("../../middleware/auth.middleware");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: "Too many attempts, try again later" },
});

// Public routes
router.post("/refresh", refreshToken);
router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;
