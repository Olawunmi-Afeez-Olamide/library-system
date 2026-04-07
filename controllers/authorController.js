const Author = require("../models/Author");

// @desc    Create a new author
// @route   POST /api/authors
// @access  Public
const createAuthor = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const author = await Author.create({ name, bio });

    res.status(201).json({
      success: true,
      message: "Author created successfully",
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
const getAllAuthors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const [authors, total] = await Promise.all([
      Author.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Author.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: authors.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: authors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single author
// @route   GET /api/authors/:id
// @access  Public
const getAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }

    res.status(200).json({
      success: true,
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update author
// @route   PUT /api/authors/:id
// @access  Public
const updateAuthor = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { name, bio },
      { new: true, runValidators: true }
    );

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Author updated successfully",
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete author
// @route   DELETE /api/authors/:id
// @access  Public
const deleteAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Author deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthor,
  updateAuthor,
  deleteAuthor,
};
