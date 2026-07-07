const { validationResult } = require("express-validator");
const ApiError = require("./ApiError");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    return next(new ApiError(400, message));
  }
  next();
};

module.exports = validate;
