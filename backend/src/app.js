const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { NODE_ENV } = require("./config/env");

const app = express();

const authRoutes = require("./modules/auth/auth.routes");
const notesRoutes = require("./modules/notes/notes.routes");
const quizRoutes = require("./modules/quiz/quiz.routes");
const userRoutes = require("./modules/users/user.routes");
const sessionRoutes = require("./modules/sessions/session.routes");

// Security & parsing middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging in development only
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);

// Error middleware
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large (max 10MB)"
        : err.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;