const { PDFParse } = require("pdf-parse");
const ApiError = require("../../utils/ApiError");

const Note = require("./notes.model");

// Extracts plain text from a PDF file buffer.
// NOTE: this only handles text-based PDFs for now.
// Scanned/image-only PDFs will return little or no text — OCR (tesseract.js)
// fallback can be added here later once this base flow is confirmed working.
//
// pdf-parse v2 uses a different API than v1 (PDFParse class instead of a
// plain function call) — see https://github.com/mehmet-kozan/pdf-parse
async function extractTextFromPdf(buffer) {
  if (!buffer || !buffer.length) {
    throw new ApiError(400, "No file data received");
  }

  const parser = new PDFParse({ data: buffer });
  let result;
  try {
    result = await parser.getText();
  } catch (err) {
    if (err?.name === "PasswordException") {
      throw new ApiError(400, "This PDF is password-protected. Please upload an unlocked PDF.");
    }
    throw new ApiError(400, "Could not read this PDF. Make sure it isn't corrupted or password-protected.");
  } finally {
    await parser.destroy();
  }

  const text = (result.text || "").trim();

  if (!text) {
    throw new ApiError(
      422,
      "No readable text found in this PDF. It may be a scanned/image-only document — OCR support is coming soon."
    );
  }

  return { text, numPages: result.total ?? result.pages?.length ?? null };
}

// save user notes, 1 notes per user, per course session
const saveNote = async (userId, courseId, content, source = "typed") => {
  // upsert — update if exists, create if not
  const note = await Note.findOneAndUpdate(
    { user: userId, courseId },
    { content, source },
    { upsert: true, new: true }
  );
  return note;
};


module.exports = { extractTextFromPdf, saveNote };