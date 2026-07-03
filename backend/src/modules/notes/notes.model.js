const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["typed", "pdf"],
      default: "typed",
    },
  },
  { timestamps: true }
);

// One note per user per course — upsert pattern
noteSchema.index({ user: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Note", noteSchema);
