const User = require("../auth/auth.model");
const ApiError = require("../../utils/ApiError");

const setupProfile = async (userId, { bio, skillsTeach, skillsLearn }) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.from("USER_NOT_FOUND");

  // Only update fields that were actually sent
  if (bio !== undefined) user.bio = bio;
  if (skillsTeach !== undefined) user.skillsTeach = skillsTeach;
  if (skillsLearn !== undefined) user.skillsLearn = skillsLearn;

  // Mark profile as complete if they have at least one skill in each
  if (user.skillsTeach.length > 0 && user.skillsLearn.length > 0) {
    user.isProfileComplete = true;
  }

  await user.save({ validateBeforeSave: false });

  return user;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select(
    "name avatar bio skillsTeach skillsLearn xp streak isProfileComplete createdAt"
  );
  if (!user) throw ApiError.from("USER_NOT_FOUND");
  return user;
};

module.exports = { setupProfile, getUserById };
