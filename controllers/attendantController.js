const jwt = require("jsonwebtoken");
const LibraryAttendant = require("../models/LibraryAttendant");

// Helper: Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @desc    Register / Create a new attendant
// @route   POST /api/attendants
// @access  Public
const createAttendant = async (req, res, next) => {
  try {
    const { name, staffId, email, password, role } = req.body;
    const attendant = await LibraryAttendant.create({
      name,
      staffId,
      email,
      password,
      role,
    });

    // Don't send password back
    attendant.password = undefined;

    res.status(201).json({
      success: true,
      message: "Library attendant created successfully",
      data: attendant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login attendant
// @route   POST /api/attendants/login
// @access  Public
const loginAttendant = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const attendant = await LibraryAttendant.findOne({ email }).select(
      "+password"
    );

    if (!attendant || !(await attendant.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(attendant._id);

    attendant.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: attendant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendants
// @route   GET /api/attendants
// @access  Public
const getAllAttendants = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { staffId: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [attendants, total] = await Promise.all([
      LibraryAttendant.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      LibraryAttendant.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: attendants.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: attendants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single attendant
// @route   GET /api/attendants/:id
// @access  Public
const getAttendant = async (req, res, next) => {
  try {
    const attendant = await LibraryAttendant.findById(req.params.id);

    if (!attendant) {
      return res.status(404).json({
        success: false,
        message: "Library attendant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: attendant,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAttendant,
  loginAttendant,
  getAllAttendants,
  getAttendant,
};
