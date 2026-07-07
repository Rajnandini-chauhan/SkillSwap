const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth.middleware");
const {
  startSession,
  endSession,
  getMySessions,
  getMyStats,
} = require("./session.controller");
const { startSessionRules, endSessionRules, validate } = require("./session.validation");


// All session routes are protected
router.use(protect);

router.post("/start", startSessionRules, validate, startSession);
router.patch("/:id/end", endSessionRules, validate, endSession);
router.get("/my", getMySessions);
router.get("/stats", getMyStats);

module.exports = router;
