const express = require("express");
const router = express.Router();
const {
  createAuthor,
  getAllAuthors,
  getAuthor,
  updateAuthor,
  deleteAuthor,
} = require("../controllers/authorController");
const { validateAuthor, validateMongoId } = require("../middleware/validate");

router.route("/").get(getAllAuthors).post(validateAuthor, createAuthor);

router
  .route("/:id")
  .get(validateMongoId(), getAuthor)
  .put(validateMongoId(), validateAuthor, updateAuthor)
  .delete(validateMongoId(), deleteAuthor);

module.exports = router;
