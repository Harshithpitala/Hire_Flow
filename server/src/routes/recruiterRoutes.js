const express = require('express');
const router = express.Router();
const {
  getMyRecruiterProfile,
  updateRecruiterProfile,
  saveCompanyProfile,
  getCompanyById,
  getRecruiterAnalytics
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/auth');

// Public company inquiry
router.get('/company/:id', getCompanyById);

// Protected recruiter-only management routes
router.get('/profile/me', protect, authorize('recruiter'), getMyRecruiterProfile);
router.put('/profile', protect, authorize('recruiter'), updateRecruiterProfile);
router.post('/company', protect, authorize('recruiter'), saveCompanyProfile);
router.get('/analytics', protect, authorize('recruiter'), getRecruiterAnalytics);


module.exports = router;