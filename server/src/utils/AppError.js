class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} statusCode - HTTP status code (4xx, 5xx)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Marks expected operational errors

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;