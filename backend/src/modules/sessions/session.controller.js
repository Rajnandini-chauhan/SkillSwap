const asyncHandler = require("../../utils/asyncHandler");
const sessionService = require("./session.service");
const ApiError = require("../../utils/ApiError");

const startSession = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) throw new ApiError(400, "courseId is required");

  const session = await sessionService.startSession(req.user._id, courseId);

  res.status(201).json({
    success: true,
    message: "Session started",
    data: { session },
  });
});

const endSession = asyncHandler(async (req, res) => {
  const { durationMinutes, pomodorosCompleted, completed } = req.body;

  const result = await sessionService.endSession(
    req.user._id,
    req.params.id,
    { durationMinutes, pomodorosCompleted, completed }
  );

  res.status(200).json({
    success: true,
    message: "Session ended",
    data: result,
  });
});

const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await sessionService.getMySessions(req.user._id);

  res.status(200).json({
    success: true,
    data: { sessions },
  });
});

const getMyStats = asyncHandler(async (req, res) => {
  const stats = await sessionService.getMyStats(req.user._id);

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

module.exports = { startSession, endSession, getMySessions, getMyStats };
