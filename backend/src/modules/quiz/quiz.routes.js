const express = require("express");

const { protect } = require("../../middleware/auth.middleware");

const {
  startQuiz,
  getQuizSession,
  submitAnswer,
  generateNextFollowUp,
} = require("./quiz.controller");

const router = express.Router();

// Every quiz route requires a logged-in user.
router.use(protect);

// Create a new five-question quiz from submitted notes.
router.post("/start", startQuiz);

// Restore an existing quiz session after refresh.
router.get("/:sessionId", getQuizSession);

// Submit an answer for the current basic or follow-up question.
router.post("/:sessionId/answer", submitAnswer);

// Generate the first or next follow-up question.
// The controller allows this only after all five basic answers are correct.
router.post("/:sessionId/follow-up", generateNextFollowUp);

module.exports = router;