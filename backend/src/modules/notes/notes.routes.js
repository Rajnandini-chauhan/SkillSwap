const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../../middleware/auth.middleware");
const { extractPdf, saveNotes } = require("./notes.controller");
const ApiError = require("../../utils/ApiError");

// In-memory storage — we only need the buffer to extract text, no need to
// persist the raw file to disk/cloud for this basic version.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new ApiError(400, "Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// Protected — must be logged in to use this.
router.post("/extract-pdf", protect, upload.single("pdf"), extractPdf);
router.post("/save", protect, saveNotes);

module.exports = router;