const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth.middleware");
const {
  createReflection,
  getMyReflections,
  getReflectionById,
  updateReflection,
  deleteReflection,
} = require("./reflection.controller");
const { createReflectionRules, updateReflectionRules, validate } = require("./reflection.validation");


router.use(protect); // all reflection routes are protected

router.post("/", createReflectionRules, validate, createReflection);
router.get("/my", getMyReflections);
router.get("/:id", getReflectionById);
router.patch("/:id", updateReflectionRules, validate, updateReflection);
router.delete("/:id", deleteReflection);

module.exports = router;
