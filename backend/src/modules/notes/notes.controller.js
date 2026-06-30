const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const { extractTextFromPdf } = require("./notes.service");

// POST /api/notes/extract-pdf
// Expects a single PDF file uploaded under field name "pdf" (multer, memory storage).
const extractPdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No PDF file uploaded");
  }

  const { text, numPages } = await extractTextFromPdf(req.file.buffer);

  res.json({
    success: true,
    data: { text, numPages },
  });
});

module.exports = { extractPdf };