const express = require('express');
const router = express.Router();
const {
  applyForJob,
  checkApplicationStatus,
  getMyApplications,
  getRecruiterApplicants,
  getApplicationResumeDownload,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// Student endpoints
router.post('/', protect, authorize('student'), applyForJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/check/:jobId', protect, authorize('student'), checkApplicationStatus);

// Recruiter endpoints
router.get('/recruiter', protect, authorize('recruiter', 'admin'), getRecruiterApplicants);
router.get('/:id/resume-download', protect, authorize('recruiter', 'admin'), getApplicationResumeDownload);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
