export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    console.error("Unhandled request error", {
      method: req.method,
      path: req.originalUrl,
      message: error.message,
    });
  }

  res.status(statusCode).json({
    message:
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message || "Internal server error",
    status: "error",
  });
}
