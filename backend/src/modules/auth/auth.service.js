const crypto = require("crypto");
const { sendVerificationEmail } = require("../../services/email.service");
const User = require("./auth.model");
const ApiError = require("../../utils/ApiError");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../utils/jwt");


const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.from("EMAIL_TAKEN");

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    name,
    email,
    password,
    verificationToken,
    verificationTokenExpiry,
  });

  // Send verification email — don't await, don't block registration
  sendVerificationEmail(email, name, verificationToken).catch((err) =>
    console.error("Verification email failed:", err.message)
  );

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isProfileComplete: user.isProfileComplete,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.from("INVALID_CREDENTIALS");

  // Check verification BEFORE password 
  // to unverified accounts
  if (!user.isVerified) throw ApiError.from("UNVERIFIED_EMAIL");

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw ApiError.from("INVALID_CREDENTIALS");

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

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
  if (!user) throw ApiError.from("USER_NOT_FOUND");
  return user;
};

const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw ApiError.from("NO_REFRESH");

  // Verify the token is valid and not tampered
  const decoded = verifyRefreshToken(incomingRefreshToken);

  //  Find user and check their stored refresh token
  const user = await User.findById(decoded.userId).select("+refreshToken");
  if (!user) throw ApiError.from("INVALID_TOKEN");

  //  Make sure it matches what's in DB (detects token reuse after logout)
  if (user.refreshToken !== incomingRefreshToken) throw ApiError.from("INVALID_REFRESH");


  // Issue a fresh access token
  const accessToken = generateAccessToken(user._id);
  return { accessToken };
};

const verifyEmail = async (token) => {
  const user = await User.findOne({ verificationToken: token }).select(
    "+verificationToken +verificationTokenExpiry"
  );

  if (!user) throw ApiError.from("INVALID_VERIFY_TOKEN");
  if (user.verificationTokenExpiry < new Date()) throw ApiError.from("EXPIRED_VERIFY_TOKEN");

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save({ validateBeforeSave: false });
};

const resendVerification = async (email) => {
  const user = await User.findOne({ email }).select(
    "+verificationToken +verificationTokenExpiry"
  );

  // Always return success even if email not found — prevents email enumeration
  if (!user || user.isVerified) return;

  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  sendVerificationEmail(user.email, user.name, verificationToken).catch((err) =>
    console.error("Resend verification email failed:", err.message)
  );
};

module.exports = { registerUser, loginUser, logoutUser, getMe, refreshAccessToken, verifyEmail, resendVerification };
