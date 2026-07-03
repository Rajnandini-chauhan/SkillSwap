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

router.use(protect); // all reflection routes are protected

router.post("/", createReflection);
router.get("/my", getMyReflections);
router.get("/:id", getReflectionById);
router.patch("/:id", updateReflection);
router.delete("/:id", deleteReflection);

module.exports = router;
