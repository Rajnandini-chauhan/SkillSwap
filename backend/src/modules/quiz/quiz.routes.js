const express = require("express");
const rateLimit = require("express-rate-limit");

const { protect } = require("../../middleware/auth.middleware");

const {
  startQuiz,
  getQuizSession,
  submitAnswer,
  generateNextFollowUp,
} = require("./quiz.controller");

const router = express.Router();

// rate limiter to protect gemini api tokens
const quizGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max 10 quiz generations per hour per IP
  message: {
    success: false,
    message: "Too many quizzes generated. Please wait before starting a new one.",
  },
});

// Every quiz route requires a logged-in user.
router.use(protect);

// Create a new five-question quiz from submitted notes.
router.post("/start", quizGenerationLimiter, startQuiz);

// Restore an existing quiz session after refresh.
router.get("/:sessionId", getQuizSession);

// Submit an answer for the current basic or follow-up question.
router.post("/:sessionId/answer", submitAnswer);

// Generate the first or next follow-up question.
// The controller allows this only after all five basic answers are correct.
router.post("/:sessionId/follow-up", generateNextFollowUp);

module.exports = router;