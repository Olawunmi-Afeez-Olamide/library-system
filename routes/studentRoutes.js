const express = require("express");
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudent,
} = require("../controllers/studentController");
const { validateStudent, validateMongoId } = require("../middleware/validate");

router.route("/").get(getAllStudents).post(validateStudent, createStudent);

router.route("/:id").get(validateMongoId(), getStudent);

module.exports = router;
