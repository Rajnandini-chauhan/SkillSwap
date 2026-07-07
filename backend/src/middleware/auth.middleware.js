const { verifyAccessToken } = require("../utils/jwt");
const User = require("../modules/auth/auth.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  // Grab token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) throw ApiError.from("NO_TOKEN");


  const token = authHeader.split(" ")[1];

  // Verify token — throws if expired or tampered
  const decoded = verifyAccessToken(token);

  // Fetch user from DB
  const user = await User.findById(decoded.userId);
  if (!user) throw ApiError.from("USER_NOT_FOUND");

  // Attach to request
  req.user = user;
  next();
});

module.exports = { protect };
