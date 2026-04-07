const express = require("express");
const router = express.Router();
const {
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getOverdueBooks,
} = require("../controllers/bookController");
const {
  validateBook,
  validateBorrow,
  validateMongoId,
} = require("../middleware/validate");

// Special routes first (before /:id to avoid conflicts)
router.get("/overdue", getOverdueBooks);

router.route("/").get(getAllBooks).post(validateBook, createBook);

router
  .route("/:id")
  .get(validateMongoId(), getBook)
  .put(validateMongoId(), validateBook, updateBook)
  .delete(validateMongoId(), deleteBook);

router.post("/:id/borrow", validateMongoId(), validateBorrow, borrowBook);
router.post("/:id/return", validateMongoId(), returnBook);

module.exports = router;
