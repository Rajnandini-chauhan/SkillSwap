const PDFParse = require("pdf-parse");
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
  if (!buffer || !buffer.length) throw ApiError.from("NO_FILE_DATA");

  const parser = new PDFParse({ data: buffer });
  let result;
  try {
    result = await parser.getText();
  } catch (err) {
    if (err?.name === "PasswordException") {
      throw ApiError.from("PROTECTED_PDF");
    }
    throw ApiError.from("INVALID_PDF");
  } finally {
    await parser.destroy();
  }

  const text = (result.text || "").trim();

  if (!text) {
    throw ApiError.from("NO_PDF_TEXT");
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