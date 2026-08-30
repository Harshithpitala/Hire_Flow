const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPasswordWithOtp,
  resetPasswordWithToken
} = require('../controllers/authController');
const {
  validateRegister,
  validateLogin
} = require('../validators/authValidator');
const { protect, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

// Public endpoints with brute-force rate limiting
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password-otp', authLimiter, resetPasswordWithOtp);
router.put('/reset-password/:token', authLimiter, resetPasswordWithToken);

// Authenticated user endpoints
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Role verification test endpoints
router.get('/student-only', protect, authorize('student'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Student!' });
});

router.get('/recruiter-only', protect, authorize('recruiter'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Recruiter!' });
});

router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Administrator!' });
});

module.exports = router;
