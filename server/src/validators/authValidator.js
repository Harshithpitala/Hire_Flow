const AppError = require('../utils/AppError');

exports.validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError('Please provide your full name', 400));
  }

  if (!email || !email.trim()) {
    return next(new AppError('Please provide an email address', 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (!password || password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }

  if (role && !['student', 'recruiter', 'admin'].includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both email and password', 400));
  }

  next();
};