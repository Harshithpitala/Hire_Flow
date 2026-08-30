const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendTokenResponse } = require('../utils/tokenUtils');
const {
  sendWelcomeEmail,
  sendPasswordResetOtpEmail
} = require('../services/emailService');

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists', 409));
    }

    const assignedRole =
      role === 'admin' && process.env.NODE_ENV === 'production'
        ? 'student'
        : role || 'student';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole
    });

    // Send welcome email asynchronously without blocking the response
    sendWelcomeEmail(user).catch((err) =>
      console.error('[Welcome Email Error]:', err.message)
    );

    sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide both email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password credentials', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password credentials', 401));
    }

    if (!user.isActive) {
      return next(
        new AppError('Your account has been deactivated. Please contact support.', 403)
      );
    }

    sendTokenResponse(user, 200, res, 'Authentication successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update basic user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Account details updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(req.body.currentPassword))) {
      return next(new AppError('Current password provided is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate & Email 6-Digit Password Reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError('Please provide your registered email address.', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak user existence
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, an OTP code has been sent.'
      });
    }

    const otp = user.createPasswordResetOtp();
    await user.save({ validateBeforeSave: false });

    // Send OTP to user's real email
    await sendPasswordResetOtpEmail(user, otp);

    res.status(200).json({
      success: true,
      message: 'A 6-digit OTP has been dispatched to your email address.',
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP and Reset Password
 * @route   POST /api/auth/reset-password-otp
 * @access  Public
 */
exports.resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return next(new AppError('Please provide email, OTP code, and new password.', 400));
    }

    // Hash submitted OTP to compare with DB value
    const hashedOtp = crypto
      .createHash('sha256')
      .update(otp.trim())
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired OTP code.', 400));
    }

    // Update password and clear OTP fields
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset a password with the one-time token sent in a reset-link email
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPasswordWithToken = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Password reset token is invalid or has expired.', 400));
    }

    if (!req.body.password || req.body.password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long.', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
  } catch (error) {
    next(error);
  }
};
