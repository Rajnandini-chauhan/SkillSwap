const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false, // true only when quiz is done
    },
    pomodorosCompleted: {
      type: Number,
      default: 0, // frontend tracks and sends this on end
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
