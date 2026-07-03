const mongoose = require("mongoose");

const reflectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weekStart: {
      type: Date,
      required: true, // Monday of the week this reflection is for
    },
    learned: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    difficult: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    nextWeekGoal: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    mood: {
      type: String,
      enum: ["great", "good", "okay", "tough"],
      default: "good",
    },
  },
  { timestamps: true }
);

// One reflection per user per week
reflectionSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("Reflection", reflectionSchema);
