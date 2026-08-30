const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Schema Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  // Handle MongoDB Unique Key Duplication Errors (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field} field. Please choose another value.`;
  }

  // Handle Invalid MongoDB ObjectId Cast Errors
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with identifier: ${err.value}`;
  }

  // Handle Invalid / Expired JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authorization token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authorization token has expired. Please log in again.';
  }

  res.status(statusCode).json({
    success: false,
    status: err.status || 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;