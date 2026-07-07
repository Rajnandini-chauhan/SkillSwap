const Session = require("./session.model");
const User = require("../auth/auth.model");
const ApiError = require("../../utils/ApiError");

const startSession = async (userId, courseId) => {
  // Check if there's already an active session for this course
  const existing = await Session.findOne({
    user: userId,
    courseId,
    endTime: null,
  });

  if (existing) return existing; // return it instead of creating duplicate

  const session = await Session.create({
    user: userId,
    courseId,
    startTime: new Date(),
  });

  return session;
};

const calculateXP = (durationMinutes, pomodorosCompleted) => {
  const base = 10;
  const timeBonus = Math.floor(durationMinutes / 30) * 5;
  const pomodoroBonus = pomodorosCompleted * 5;
  return base + timeBonus + pomodoroBonus;
};

const updateStreak = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = user.lastActiveDate
    ? new Date(user.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today - lastActive) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return; // already studied today, no change
    if (diffDays === 1) user.streak += 1; // studied yesterday, continue streak
    if (diffDays > 1) user.streak = 1;  // missed days, reset
  } else {
    user.streak = 1; // first ever session
  }

  user.lastActiveDate = new Date();
};

const endSession = async (userId, sessionId, { durationMinutes, pomodorosCompleted, completed }) => {
  const session = await Session.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!session) throw ApiError.from("SESSION_NOT_FOUND");
  if (session.endTime) throw ApiError.from("SESSION_ALREADY_ENDED");

  const xpEarned = completed ? calculateXP(durationMinutes, pomodorosCompleted) : 0;

  session.endTime = new Date();
  session.duration = durationMinutes;
  session.pomodorosCompleted = pomodorosCompleted;
  session.completed = completed;
  session.xpEarned = xpEarned;
  await session.save();

  // Update user XP and streak
  const user = await User.findById(userId);
  user.xp += xpEarned;
  if (completed) updateStreak(user);
  await user.save({ validateBeforeSave: false });

  return { session, xpEarned, streak: user.streak, totalXp: user.xp };
};

const getMySessions = async (userId) => {
  const sessions = await Session.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(20);
  return sessions;
};

const getMyStats = async (userId) => {
  const user = await User.findById(userId);

  const totalSessions = await Session.countDocuments({
    user: userId,
    completed: true,
  });

  const totalMinutes = await Session.aggregate([
    { $match: { user: user._id, completed: true } },
    { $group: { _id: null, total: { $sum: "$duration" } } },
  ]);

  return {
    xp: user.xp,
    streak: user.streak,
    totalSessions,
    totalMinutes: totalMinutes[0]?.total || 0,
  };
};

module.exports = { startSession, endSession, getMySessions, getMyStats };
