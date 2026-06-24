// custom Error Class
class ApiError extends Error {

  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks it as a known, expected error
  }
  
}

module.exports = ApiError;
