const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const { extractTextFromPdf, saveNote } = require("./notes.service");


// POST /api/notes/extract-pdf
// Expects a single PDF file uploaded under field name "pdf" (multer, memory storage).
const extractPdf = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.from("NO_FILE");

  const { text, numPages } = await extractTextFromPdf(req.file.buffer);

  res.json({
    success: true,
    data: { text, numPages },
  });
});

// POST /api/notes/save
// Save User Notes, they upolade at the start of the quiz
const saveNotes = asyncHandler(async (req, res) => {
  const { courseId, content, source } = req.body;

  if (!courseId || !content) throw new ApiError(400, "courseId and content are required");
  const note = await saveNote(req.user._id, courseId, content, source);

  res.status(200).json({
    success: true,
    message: "Notes saved",
    data: { note },
  });
});

module.exports = { extractPdf , saveNotes};