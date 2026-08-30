const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Middleware: Verifies the JWT from the Authorization header and attaches the user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract Bearer Token from headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to gain access.', 401)
      );
    }

    // 2. Verify Token Authenticity and Expiration
    const secret =
      process.env.JWT_SECRET || 'hireflow_test_jwt_secret_key_1234567890';
    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(
          new AppError('Your session has expired. Please log in again.', 401)
        );
      }
      return next(new AppError('Invalid authentication token.', 401));
    }

    // 3. Confirm user still exists in database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4. Confirm user account is active (if isActive field exists)
    if (currentUser.isActive === false) {
      return next(
        new AppError('Your account has been deactivated. Please contact support.', 403)
      );
    }

    // 5. Grant access: attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Restricts access to specified roles.
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'recruiter', 'student')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role [${req.user?.role || 'unauthorized'}] is not authorized to access this resource.`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };