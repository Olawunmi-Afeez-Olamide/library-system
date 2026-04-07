const { body, param, query, validationResult } = require("express-validator");

// Helper to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Author validators
const validateAuthor = [
  body("name").notEmpty().withMessage("Author name is required").trim(),
  body("bio").optional().trim(),
  handleValidationErrors,
];

// Book validators
const validateBook = [
  body("title").notEmpty().withMessage("Book title is required").trim(),
  body("isbn")
    .optional()
    .isString()
    .withMessage("ISBN must be a string")
    .trim(),
  body("authors")
    .optional()
    .isArray()
    .withMessage("Authors must be an array of IDs"),
  body("authors.*")
    .optional()
    .isMongoId()
    .withMessage("Each author ID must be a valid MongoDB ObjectId"),
  handleValidationErrors,
];

// Student validators
const validateStudent = [
  body("name").notEmpty().withMessage("Student name is required").trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("studentId").notEmpty().withMessage("Student ID is required").trim(),
  handleValidationErrors,
];

// Attendant validators
const validateAttendant = [
  body("name").notEmpty().withMessage("Attendant name is required").trim(),
  body("staffId").notEmpty().withMessage("Staff ID is required").trim(),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

// Borrow book validators
const validateBorrow = [
  body("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Student ID must be a valid MongoDB ObjectId"),
  body("attendantId")
    .notEmpty()
    .withMessage("Attendant ID is required")
    .isMongoId()
    .withMessage("Attendant ID must be a valid MongoDB ObjectId"),
  body("returnDate")
    .notEmpty()
    .withMessage("Return date is required")
    .isISO8601()
    .withMessage("Return date must be a valid date (ISO 8601 format)")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Return date must be in the future");
      }
      return true;
    }),
  handleValidationErrors,
];

// MongoDB ID param validator
const validateMongoId = (paramName = "id") => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`),
  handleValidationErrors,
];

module.exports = {
  validateAuthor,
  validateBook,
  validateStudent,
  validateAttendant,
  validateBorrow,
  validateMongoId,
  handleValidationErrors,
};
