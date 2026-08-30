const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test', // Bypass in test suite
  handler: (req, res, next) => {
    next(
      new AppError(
        'Too many requests received from this IP. Please try again after 15 minutes.',
        429
      )
    );
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test', // Bypass in test suite
  handler: (req, res, next) => {
    next(
      new AppError(
        'Too many authentication attempts. For your security, this IP is temporarily restricted for 15 minutes.',
        429
      )
    );
  }
});

module.exports = {
  globalLimiter,
  authLimiter
};