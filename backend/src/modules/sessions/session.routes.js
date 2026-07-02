const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth.middleware");
const {
  startSession,
  endSession,
  getMySessions,
  getMyStats,
} = require("./session.controller");

// All session routes are protected
router.use(protect);

router.post("/start", startSession);
router.patch("/:id/end", endSession);
router.get("/my", getMySessions);
router.get("/stats", getMyStats);

module.exports = router;
