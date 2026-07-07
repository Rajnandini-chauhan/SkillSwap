const { body } = require("express-validator");
const validate = require("../../utils/validate");

const createReflectionRules = [
  body("learned")
    .trim()
    .notEmpty().withMessage("learned is required")
    .isLength({ max: 1000 }).withMessage("learned cannot exceed 1000 characters"),

  body("difficult")
    .trim()
    .notEmpty().withMessage("difficult is required")
    .isLength({ max: 1000 }).withMessage("difficult cannot exceed 1000 characters"),

  body("nextWeekGoal")
    .trim()
    .notEmpty().withMessage("nextWeekGoal is required")
    .isLength({ max: 1000 }).withMessage("nextWeekGoal cannot exceed 1000 characters"),

  body("mood")
    .optional()
    .isIn(["great", "good", "okay", "tough"]).withMessage("mood must be one of: great, good, okay, tough"),
];

const updateReflectionRules = [
  body("learned")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("learned cannot exceed 1000 characters"),

  body("difficult")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("difficult cannot exceed 1000 characters"),

  body("nextWeekGoal")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("nextWeekGoal cannot exceed 1000 characters"),

  body("mood")
    .optional()
    .isIn(["great", "good", "okay", "tough"]).withMessage("mood must be one of: great, good, okay, tough"),
];

module.exports = { createReflectionRules, updateReflectionRules, validate };
