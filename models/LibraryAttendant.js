const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const libraryAttendantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Attendant name is required"],
      trim: true,
    },
    staffId: {
      type: String,
      required: [true, "Staff ID is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["attendant", "admin"],
      default: "attendant",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
libraryAttendantSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
libraryAttendantSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("LibraryAttendant", libraryAttendantSchema);
