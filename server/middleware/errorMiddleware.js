// Middleware = a function that runs between the request and the response.
// This one runs when no route matched the URL.
const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

// An error-handling middleware has 4 parameters. Express calls it whenever a controller calls next(error).
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = err.message || 'Server error';

  // Mongoose validation failed (e.g. a required field is missing)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Invalid ObjectId in the URL (e.g. /api/restaurants/abc)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
