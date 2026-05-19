export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((item) => item.message);
    return res.status(400).json({ message: "Validation error", errors });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Email already exists" });
  }

  res.status(statusCode).json({
    message: err.message || "Server error"
  });
};
