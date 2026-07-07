const { body } = require("express-validator");
const validate = require("../../utils/validate");

const startSessionRules = [
  body("courseId")
    .trim()
    .notEmpty().withMessage("courseId is required"),
];

const endSessionRules = [
  body("durationMinutes")
    .notEmpty().withMessage("durationMinutes is required")
    .isInt({ min: 0 }).withMessage("durationMinutes must be a positive number"),

  body("pomodorosCompleted")
    .notEmpty().withMessage("pomodorosCompleted is required")
    .isInt({ min: 0 }).withMessage("pomodorosCompleted must be a positive number"),

  body("completed")
    .notEmpty().withMessage("completed is required")
    .isBoolean().withMessage("completed must be a boolean"),
];

module.exports = { startSessionRules, endSessionRules, validate };
