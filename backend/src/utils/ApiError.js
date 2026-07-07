class ApiError extends Error {
  constructor(statusCode, message, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
  }
}

ApiError.ERRORS = {
  // Auth
  EMAIL_TAKEN:          { statusCode: 409, message: "Email already registered" },
  INVALID_CREDENTIALS:  { statusCode: 401, message: "Invalid email or password" },
  UNVERIFIED_EMAIL:     { statusCode: 403, message: "Please verify your email before logging in" },
  INVALID_TOKEN:        { statusCode: 401, message: "Invalid token" },
  EXPIRED_TOKEN:        { statusCode: 401, message: "Access token expired" },
  NO_TOKEN:             { statusCode: 401, message: "No token provided" },
  INVALID_REFRESH:      { statusCode: 401, message: "Refresh token expired or already used" },
  NO_REFRESH:           { statusCode: 401, message: "No refresh token" },
  INVALID_VERIFY_TOKEN: { statusCode: 400, message: "Invalid verification token" },
  EXPIRED_VERIFY_TOKEN: { statusCode: 400, message: "Verification token has expired" },

  // User
  USER_NOT_FOUND:       { statusCode: 404, message: "User not found" },

  // Sessions
  SESSION_NOT_FOUND:    { statusCode: 404, message: "Session not found" },
  SESSION_ALREADY_ENDED:{ statusCode: 400, message: "Session already ended" },

  // Notes
  NO_FILE:              { statusCode: 400, message: "No PDF file uploaded" },
  NO_FILE_DATA:         { statusCode: 400, message: "No file data received" },
  INVALID_PDF:          { statusCode: 400, message: "Could not read this PDF. Make sure it isn't corrupted or password-protected." },
  PROTECTED_PDF:        { statusCode: 400, message: "This PDF is password-protected. Please upload an unlocked PDF." },
  NO_PDF_TEXT:          { statusCode: 422, message: "No readable text found in this PDF. It may be a scanned/image-only document." },

  // Reflections
  REFLECTION_NOT_FOUND: { statusCode: 404, message: "Reflection not found" },
  REFLECTION_EXISTS:    { statusCode: 409, message: "You have already reflected this week" },

  // Quiz
  QUIZ_NOT_FOUND:       { statusCode: 404, message: "Quiz session not found" },

  // General
  NOT_FOUND:            { statusCode: 404, message: "Resource not found" },
  INTERNAL:             { statusCode: 500, message: "Something went wrong" },
};

ApiError.from = (errorKey) => {
  const err = ApiError.ERRORS[errorKey];
  if (!err) throw new Error(`Unknown error key: ${errorKey}`);
  return new ApiError(err.statusCode, err.message, errorKey);
};

module.exports = ApiError;
