const Student = require("../models/Student");
const Book = require("../models/Book");

// @desc    Create a new student
// @route   POST /api/students
// @access  Public
const createStudent = async (req, res, next) => {
  try {
    const { name, email, studentId } = req.body;
    const student = await Student.create({ name, email, studentId });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { studentId: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      Student.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Student.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student with their borrowed books
// @route   GET /api/students/:id
// @access  Public
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get currently borrowed books
    const borrowedBooks = await Book.find({
      borrowedBy: student._id,
      status: "OUT",
    })
      .populate("authors")
      .select("title isbn status returnDate isOverdue");

    res.status(200).json({
      success: true,
      data: student,
      borrowedBooks: {
        count: borrowedBooks.length,
        books: borrowedBooks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudent,
};
