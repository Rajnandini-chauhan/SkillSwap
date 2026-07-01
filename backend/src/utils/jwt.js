// JsonWebToken, generate and Refresh functions

const jwt = require("jsonwebtoken");
const ApiError = require("./ApiError");
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require("../config/env");

const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (err) {
    if (
      err instanceof jwt.TokenExpiredError ||
      err instanceof jwt.JsonWebTokenError
    ) {
      throw new ApiError(401, "Access token expired");
    }

    throw err;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (err) {
    if (
      err instanceof jwt.TokenExpiredError ||
      err instanceof jwt.JsonWebTokenError
    ) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    throw err;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
