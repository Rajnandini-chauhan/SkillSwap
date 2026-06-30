const mongoose = require("mongoose");

const questionStatusValues = [
  "unanswered",
  "correct",
  "partially_correct",
  "incorrect",
  "off_topic",
];

const basicQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: questionStatusValues,
      default: "unanswered",
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },

    hint: {
      type: String,
      default: "",
      trim: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const followUpQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },

    answer: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: questionStatusValues,
      default: "unanswered",
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },

    hint: {
      type: String,
      default: "",
      trim: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const quizSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      required: true,
      trim: true,
    },

    stage: {
      type: String,
      enum: ["basic", "basic_completed", "follow_up"],
      default: "basic",
    },

    currentBasicIndex: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },

    basicQuestions: {
      type: [basicQuestionSchema],
      required: true,
      validate: {
        validator(questions) {
          return Array.isArray(questions) && questions.length === 5;
        },
        message: "A basic quiz must contain exactly five questions.",
      },
    },

    followUpQuestions: {
      type: [followUpQuestionSchema],
      default: [],
    },

    currentFollowUpIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

quizSessionSchema.index({
  user: 1,
  courseId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("QuizSession", quizSessionSchema);