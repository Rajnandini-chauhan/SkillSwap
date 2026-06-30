const mongoose = require("mongoose");

const QuizSession = require("./quiz.model");
const {
  generateBasicQuestions,
  evaluateAnswer,
  generateFollowUpQuestion,
} = require("./quiz.service");

const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

function requireText(value, fieldName, minimumLength = 1) {
  if (
    typeof value !== "string" ||
    value.trim().length < minimumLength
  ) {
    throw new ApiError(
      400,
      `${fieldName} must contain at least ${minimumLength} characters`
    );
  }

  return value.trim();
}

function validateSessionId(sessionId) {
  if (!mongoose.isValidObjectId(sessionId)) {
    throw new ApiError(400, "Invalid quiz session ID");
  }
}

async function findOwnedSession(sessionId, userId) {
  validateSessionId(sessionId);

  const session = await QuizSession.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    throw new ApiError(404, "Quiz session not found");
  }

  return session;
}

function formatQuestion(question, number, total, type) {
  if (!question) return null;

  return {
    id: question._id,
    type,
    number,
    total,
    text: question.question,
    attempts: question.attempts,
  };
}

function getCurrentQuestion(session) {
  if (session.stage === "basic") {
    const question =
      session.basicQuestions[session.currentBasicIndex];

    return formatQuestion(
      question,
      session.currentBasicIndex + 1,
      session.basicQuestions.length,
      "basic"
    );
  }

  if (session.stage === "follow_up") {
    const question =
      session.followUpQuestions[
        session.currentFollowUpIndex
      ];

    return formatQuestion(
      question,
      session.currentFollowUpIndex + 1,
      session.followUpQuestions.length,
      "follow_up"
    );
  }

  return null;
}

function countCorrectBasicAnswers(session) {
  return session.basicQuestions.filter(
    (question) => question.status === "correct"
  ).length;
}

function buildSessionResponse(session) {
  const correctBasicAnswers =
    countCorrectBasicAnswers(session);

  return {
    sessionId: session._id,
    courseId: session.courseId,
    stage: session.stage,

    progress: {
      correctBasicAnswers,
      totalBasicQuestions:
        session.basicQuestions.length,
      percentage: Math.round(
        (correctBasicAnswers /
          session.basicQuestions.length) *
          100
      ),
    },

    currentQuestion: getCurrentQuestion(session),

    basicQuizCompleted:
      session.stage === "basic_completed" ||
      session.stage === "follow_up",

    followUpUnlocked:
      session.stage === "basic_completed" ||
      session.stage === "follow_up",

    followUpCount:
      session.followUpQuestions.length,

    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

// POST /api/quiz/start
const startQuiz = asyncHandler(async (req, res) => {
  const notes = requireText(
    req.body.notes,
    "Notes",
    20
  );

  const courseId = requireText(
    String(req.body.courseId || ""),
    "Course ID",
    1
  );

  const basicQuestions =
    await generateBasicQuestions(notes);

  const session = await QuizSession.create({
    user: req.user._id,
    courseId,
    notes,
    stage: "basic",
    currentBasicIndex: 0,
    basicQuestions,
    followUpQuestions: [],
    currentFollowUpIndex: 0,
  });

  res.status(201).json({
    success: true,
    message: "Quiz created successfully",
    data: buildSessionResponse(session),
  });
});

// GET /api/quiz/:sessionId
const getQuizSession = asyncHandler(
  async (req, res) => {
    const session = await findOwnedSession(
      req.params.sessionId,
      req.user._id
    );

    res.json({
      success: true,
      data: buildSessionResponse(session),
    });
  }
);

// POST /api/quiz/:sessionId/answer
const submitAnswer = asyncHandler(
  async (req, res) => {
    const answer = requireText(
      req.body.answer,
      "Answer",
      1
    );

    const session = await findOwnedSession(
      req.params.sessionId,
      req.user._id
    );

    let currentQuestion;
    let questionType;

    if (session.stage === "basic") {
      currentQuestion =
        session.basicQuestions[
          session.currentBasicIndex
        ];

      questionType = "basic";
    } else if (session.stage === "follow_up") {
      currentQuestion =
        session.followUpQuestions[
          session.currentFollowUpIndex
        ];

      questionType = "follow_up";
    } else {
      throw new ApiError(
        400,
        "The basic quiz is complete. Start a follow-up question first."
      );
    }

    if (!currentQuestion) {
      throw new ApiError(
        400,
        "No active quiz question was found"
      );
    }

    if (currentQuestion.status === "correct") {
      throw new ApiError(
        400,
        "This question has already been answered correctly"
      );
    }

    const evaluation = await evaluateAnswer({
      notes: session.notes,
      question: currentQuestion.question,
      answer,
    });

    currentQuestion.answer = answer;
    currentQuestion.status = evaluation.status;
    currentQuestion.feedback =
      evaluation.feedback;
    currentQuestion.hint = evaluation.hint;
    currentQuestion.attempts += 1;

    let nextQuestion = null;
    let basicQuizCompleted = false;

    if (
      questionType === "basic" &&
      evaluation.status === "correct"
    ) {
      const isLastBasicQuestion =
        session.currentBasicIndex ===
        session.basicQuestions.length - 1;

      if (isLastBasicQuestion) {
        session.stage = "basic_completed";
        session.completedAt = new Date();
        basicQuizCompleted = true;
      } else {
        session.currentBasicIndex += 1;

        nextQuestion = formatQuestion(
          session.basicQuestions[
            session.currentBasicIndex
          ],
          session.currentBasicIndex + 1,
          session.basicQuestions.length,
          "basic"
        );
      }
    }

    await session.save();

    res.json({
      success: true,

      data: {
        sessionId: session._id,
        questionType,

        evaluation: {
          status: evaluation.status,
          feedback: evaluation.feedback,
          hint: evaluation.hint,
          canContinue:
            evaluation.canContinue,
          canRetry: evaluation.canRetry,
        },

        progress: {
          correctBasicAnswers:
            countCorrectBasicAnswers(session),

          totalBasicQuestions:
            session.basicQuestions.length,

          percentage: Math.round(
            (countCorrectBasicAnswers(session) /
              session.basicQuestions.length) *
              100
          ),
        },

        nextQuestion,
        basicQuizCompleted,
        followUpUnlocked:
          session.stage ===
            "basic_completed" ||
          session.stage === "follow_up",
      },
    });
  }
);

// POST /api/quiz/:sessionId/follow-up
const generateNextFollowUp = asyncHandler(
  async (req, res) => {
    const session = await findOwnedSession(
      req.params.sessionId,
      req.user._id
    );

    const allBasicAnswersCorrect =
      session.basicQuestions.every(
        (question) =>
          question.status === "correct"
      );

    if (!allBasicAnswersCorrect) {
      throw new ApiError(
        400,
        "All five basic questions must be answered correctly before starting follow-up questions."
      );
    }

    const activeFollowUp =
      session.followUpQuestions[
        session.currentFollowUpIndex
      ];

    if (
      session.stage === "follow_up" &&
      activeFollowUp &&
      activeFollowUp.status !== "correct"
    ) {
      throw new ApiError(
        400,
        "Answer the current follow-up question correctly before generating another one."
      );
    }

    const followUpQuestion =
      await generateFollowUpQuestion({
        notes: session.notes,

        basicQuestions:
          session.basicQuestions,

        previousFollowUpQuestions:
          session.followUpQuestions,
      });

    session.followUpQuestions.push(
      followUpQuestion
    );

    session.currentFollowUpIndex =
      session.followUpQuestions.length - 1;

    session.stage = "follow_up";

    await session.save();

    const createdQuestion =
      session.followUpQuestions[
        session.currentFollowUpIndex
      ];

    res.status(201).json({
      success: true,
      message:
        "Follow-up question generated successfully",

      data: {
        sessionId: session._id,
        stage: session.stage,

        currentQuestion: {
          ...formatQuestion(
            createdQuestion,
            session.currentFollowUpIndex + 1,
            session.followUpQuestions.length,
            "follow_up"
          ),

          reason: createdQuestion.reason || "",
        },
      },
    });
  }
);

module.exports = {
  startQuiz,
  getQuizSession,
  submitAnswer,
  generateNextFollowUp,
};