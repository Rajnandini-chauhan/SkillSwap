const { body } = require("express-validator");
const validate = require("../../utils/validate");

const setupProfileRules = [
  body("bio")
    .optional()
    .isLength({ max: 300 }).withMessage("Bio cannot exceed 300 characters"),

  body("skillsTeach")
    .optional()
    .isArray().withMessage("skillsTeach must be an array"),

  body("skillsTeach.*")
    .trim()
    .notEmpty().withMessage("Skill name cannot be empty")
    .isLength({ max: 50 }).withMessage("Skill name too long"),

  body("skillsLearn")
    .optional()
    .isArray().withMessage("skillsLearn must be an array"),

  body("skillsLearn.*")
    .trim()
    .notEmpty().withMessage("Skill name cannot be empty")
    .isLength({ max: 50 }).withMessage("Skill name too long"),
];

module.exports = { setupProfileRules, validate };
