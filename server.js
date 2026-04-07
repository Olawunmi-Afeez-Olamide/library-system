require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authorRoutes = require("./routes/authorRoutes");
const bookRoutes = require("./routes/bookRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendantRoutes = require("./routes/attendantRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/authors", authorRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendants", attendantRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "📚 School Library Management API",
    version: "1.0.0",
    endpoints: {
      authors: "/api/authors",
      books: "/api/books",
      students: "/api/students",
      attendants: "/api/attendants",
      overdueBooks: "/api/books/overdue",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 School Library API ready at http://localhost:${PORT}`);
});

module.exports = app;
