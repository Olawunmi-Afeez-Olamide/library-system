const Book = require("../models/Book");
const Author = require("../models/Author");
const Student = require("../models/Student");
const LibraryAttendant = require("../models/LibraryAttendant");

// @desc    Create a new book
// @route   POST /api/books
// @access  Public
const createBook = async (req, res, next) => {
  try {
    const { title, isbn, authors } = req.body;

    // Validate author IDs exist
    if (authors && authors.length > 0) {
      const foundAuthors = await Author.find({ _id: { $in: authors } });
      if (foundAuthors.length !== authors.length) {
        return res.status(400).json({
          success: false,
          message: "One or more author IDs are invalid",
        });
      }
    }

    const book = await Book.create({ title, isbn, authors });
    await book.populate("authors");

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all books with pagination + search
// @route   GET /api/books
// @access  Public
const getAllBooks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      overdue,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = {};

    if (status && ["IN", "OUT"].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    if (overdue === "true") {
      query.status = "OUT";
      query.returnDate = { $lt: new Date() };
    }

    // Search by title (will handle author search after populate)
    if (search) {
      // First find authors matching search
      const matchingAuthors = await Author.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const authorIds = matchingAuthors.map((a) => a._id);

      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { authors: { $in: authorIds } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }

    const [books, total] = await Promise.all([
      Book.find(query)
        .populate("authors")
        .populate("borrowedBy")
        .populate("issuedBy")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Book.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("authors")
      .populate("borrowedBy")
      .populate("issuedBy");

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Build response — include borrow details only when OUT
    const response = {
      success: true,
      data: book,
    };

    if (book.status === "OUT") {
      response.borrowInfo = {
        borrowedBy: book.borrowedBy,
        issuedBy: book.issuedBy,
        returnDate: book.returnDate,
        isOverdue: book.isOverdue,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Public
const updateBook = async (req, res, next) => {
  try {
    const { title, isbn, authors } = req.body;

    // Validate author IDs if provided
    if (authors && authors.length > 0) {
      const foundAuthors = await Author.find({ _id: { $in: authors } });
      if (foundAuthors.length !== authors.length) {
        return res.status(400).json({
          success: false,
          message: "One or more author IDs are invalid",
        });
      }
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, isbn, authors },
      { new: true, runValidators: true }
    ).populate("authors");

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Public
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.status === "OUT") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a book that is currently borrowed. Please return the book first.",
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Borrow a book
// @route   POST /api/books/:id/borrow
// @access  Public
const borrowBook = async (req, res, next) => {
  try {
    const { studentId, attendantId, returnDate } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Book must be IN to borrow
    if (book.status !== "IN") {
      return res.status(400).json({
        success: false,
        message: "Book is currently borrowed and not available",
      });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Verify attendant exists
    const attendant = await LibraryAttendant.findById(attendantId);
    if (!attendant) {
      return res.status(404).json({
        success: false,
        message: "Library attendant not found",
      });
    }

    // Update book
    book.status = "OUT";
    book.borrowedBy = studentId;
    book.issuedBy = attendantId;
    book.returnDate = new Date(returnDate);
    await book.save();

    await book.populate(["authors", "borrowedBy", "issuedBy"]);

    res.status(200).json({
      success: true,
      message: `Book '${book.title}' successfully borrowed by ${student.name}`,
      data: {
        book,
        borrowInfo: {
          borrowedBy: book.borrowedBy,
          issuedBy: book.issuedBy,
          returnDate: book.returnDate,
          isOverdue: book.isOverdue,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return a book
// @route   POST /api/books/:id/return
// @access  Public
const returnBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate([
      "authors",
      "borrowedBy",
      "issuedBy",
    ]);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Book must be OUT to return
    if (book.status !== "OUT") {
      return res.status(400).json({
        success: false,
        message: "Book is not currently borrowed",
      });
    }

    const wasOverdue = book.isOverdue;
    const previousBorrower = book.borrowedBy;

    // Clear borrow data
    book.status = "IN";
    book.borrowedBy = null;
    book.issuedBy = null;
    book.returnDate = null;
    await book.save();

    res.status(200).json({
      success: true,
      message: `Book '${book.title}' successfully returned${wasOverdue ? " (was overdue)" : ""}`,
      wasOverdue,
      returnedBy: previousBorrower,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overdue books
// @route   GET /api/books/overdue
// @access  Public
const getOverdueBooks = async (req, res, next) => {
  try {
    const overdueBooks = await Book.find({
      status: "OUT",
      returnDate: { $lt: new Date() },
    })
      .populate("authors")
      .populate("borrowedBy")
      .populate("issuedBy")
      .sort({ returnDate: 1 });

    res.status(200).json({
      success: true,
      count: overdueBooks.length,
      data: overdueBooks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getOverdueBooks,
};
