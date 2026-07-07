const Reflection = require("./reflection.model");
const ApiError = require("../../utils/ApiError");

// Helper — gets the Monday of the current week
const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const createReflection = async (userId, { learned, difficult, nextWeekGoal, mood }) => {
  const weekStart = getWeekStart();

  // unique index will catch duplicates, but let's give a clean error
  const existing = await Reflection.findOne({ user: userId, weekStart });
  if (existing) throw ApiError.from("REFLECTION_EXISTS");

  const reflection = await Reflection.create({
    user: userId,
    weekStart,
    learned,
    difficult,
    nextWeekGoal,
    mood,
  });

  return reflection;
};

const getMyReflections = async (userId) => {
  const reflections = await Reflection.find({ user: userId })
    .sort({ weekStart: -1 }); // most recent first
  return reflections;
};

const getReflectionById = async (userId, reflectionId) => {
  const reflection = await Reflection.findOne({
    _id: reflectionId,
    user: userId,
  });
  throw ApiError.from("REFLECTION_NOT_FOUND");
  return reflection;
};

const updateReflection = async (userId, reflectionId, updates) => {
  const reflection = await Reflection.findOne({
    _id: reflectionId,
    user: userId,
  });
  throw ApiError.from("REFLECTION_NOT_FOUND");

  const allowedFields = ["learned", "difficult", "nextWeekGoal", "mood"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) reflection[field] = updates[field];
  });

  await reflection.save();
  return reflection;
};


const deleteReflection = async (userId, reflectionId) => {
  const reflection = await Reflection.findOneAndDelete({
    _id: reflectionId,
    user: userId,
  });
  throw ApiError.from("REFLECTION_NOT_FOUND");
};


module.exports = {
  createReflection,
  getMyReflections,
  getReflectionById,
  updateReflection,
  deleteReflection,
};
