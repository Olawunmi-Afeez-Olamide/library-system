const express = require("express");
const router = express.Router();
const {
  createAttendant,
  loginAttendant,
  getAllAttendants,
  getAttendant,
} = require("../controllers/attendantController");
const {
  validateAttendant,
  validateMongoId,
} = require("../middleware/validate");

router.post("/login", loginAttendant);

router
  .route("/")
  .get(getAllAttendants)
  .post(validateAttendant, createAttendant);

router.route("/:id").get(validateMongoId(), getAttendant);

module.exports = router;
