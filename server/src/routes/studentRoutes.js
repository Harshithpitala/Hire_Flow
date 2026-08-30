const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateProfile,
  getStudentProfileById,
  evaluateJobMatch
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Private student-only management endpoints
router.get('/profile/me', protect, authorize('student'), getMyProfile);
router.put('/profile', protect, authorize('student'), updateProfile);
router.get('/match/:jobId', protect, authorize('student'), evaluateJobMatch);
// Endpoint for recruiters/admins to view a candidate's profile
router.get('/profile/:userId', protect, getStudentProfileById);

module.exports = router;