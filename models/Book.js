const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["IN", "OUT"],
        message: "Status must be either IN or OUT",
      },
      default: "IN",
    },
    borrowedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryAttendant",
      default: null,
    },
    returnDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field: overdue check
bookSchema.virtual("isOverdue").get(function () {
  if (this.status === "OUT" && this.returnDate) {
    return new Date() > new Date(this.returnDate);
  }
  return false;
});

bookSchema.set("toJSON", { virtuals: true });
bookSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Book", bookSchema);
