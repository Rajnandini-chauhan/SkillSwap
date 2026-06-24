const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,    // So that, JS can't read it
  secure: process.env.NODE_ENV === "production",  // HTTPS only in prod, HTTP in Dev
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// POST : Register User
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.registerUser({ name, email, password });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { user },
  });
});

// POST : Login User
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.loginUser({ email, password });

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: { accessToken, user },
  });
});

// POST : Logout User
const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);

  res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// GET : get User Details
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// POST : Generate New AccessToken, if Refresh is Valid
const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  const { accessToken } = await authService.refreshAccessToken(incomingRefreshToken);

  res.status(200).json({
    success: true,
    data: { accessToken },
  });
});

module.exports = { register, login, logout, getMe, refreshToken };
