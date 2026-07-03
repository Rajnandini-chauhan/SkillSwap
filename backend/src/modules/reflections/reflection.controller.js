const asyncHandler = require("../../utils/asyncHandler");
const reflectionService = require("./reflection.service");

const createReflection = asyncHandler(async (req, res) => {
  const { learned, difficult, nextWeekGoal, mood } = req.body;
  const reflection = await reflectionService.createReflection(req.user._id, {
    learned,
    difficult,
    nextWeekGoal,
    mood,
  });

  res.status(201).json({
    success: true,
    message: "Reflection saved",
    data: { reflection },
  });
});

const getMyReflections = asyncHandler(async (req, res) => {
  const reflections = await reflectionService.getMyReflections(req.user._id);

  res.status(200).json({
    success: true,
    data: { reflections },
  });
});

const getReflectionById = asyncHandler(async (req, res) => {
  const reflection = await reflectionService.getReflectionById(
    req.user._id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: { reflection },
  });
});

const updateReflection = asyncHandler(async (req, res) => {
  const reflection = await reflectionService.updateReflection(
    req.user._id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Reflection updated",
    data: { reflection },
  });
});

const deleteReflection = asyncHandler(async (req, res) => {
  await reflectionService.deleteReflection(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Reflection deleted",
  });
});

module.exports = {
  createReflection,
  getMyReflections,
  getReflectionById,
  updateReflection,
  deleteReflection,
};
