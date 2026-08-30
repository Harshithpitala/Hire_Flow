const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getMyInterviews,
  getRecruiterInterviews,
  updateInterview
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

// Student endpoints
router.get('/my', protect, authorize('student'), getMyInterviews);

// Recruiter endpoints
router.post('/', protect, authorize('recruiter'), scheduleInterview);
router.get('/recruiter', protect, authorize('recruiter', 'admin'), getRecruiterInterviews);
router.patch('/:id', protect, authorize('recruiter', 'admin'), updateInterview);

module.exports = router;