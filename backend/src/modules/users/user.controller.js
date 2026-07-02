const asyncHandler = require("../../utils/asyncHandler");
const userService = require("./user.service");

const setupProfile = asyncHandler(async (req, res) => {
  const { bio, skillsTeach, skillsLearn } = req.body;
  const user = await userService.setupProfile(req.user._id, {
    bio,
    skillsTeach,
    skillsLearn,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

module.exports = { setupProfile, getUserById };
