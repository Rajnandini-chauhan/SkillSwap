const express = require("express");
const router = express.Router();
const { setupProfile, getUserById } = require("./user.controller");
const { setupProfileRules, validate } = require("./user.validation");
const { protect } = require("../../middleware/auth.middleware");

router.patch("/setup", protect, setupProfileRules, validate, setupProfile);
router.get("/:userId", getUserById); // public

module.exports = router;
