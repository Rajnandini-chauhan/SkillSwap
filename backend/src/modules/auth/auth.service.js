const User = require("./auth.model");
const ApiError = require("../../utils/ApiError");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../utils/jwt");


const registerUser = async ({ name, email, password }) => {
  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already registered");

  // Create New User
  const user = await User.create({ name, email, password });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isProfileComplete: user.isProfileComplete,
  };
};

const loginUser = async ({ email, password }) => {
  // Find user (explicitly select password since it's select:false)
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  //  Compare password
  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  //  Generate both tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isProfileComplete: user.isProfileComplete,
    },
  };
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw new ApiError(401, "No refresh token");

  // Verify the token is valid and not tampered
  const decoded = verifyRefreshToken(incomingRefreshToken);

  //  Find user and check their stored refresh token
  const user = await User.findById(decoded.userId).select("+refreshToken");
  if (!user) throw new ApiError(401, "Invalid refresh token");

  //  Make sure it matches what's in DB (detects token reuse after logout)
  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token expired or already used");
  }

  // Issue a fresh access token
  const accessToken = generateAccessToken(user._id);
  return { accessToken };
};

module.exports = { registerUser, loginUser, logoutUser, getMe, refreshAccessToken };
