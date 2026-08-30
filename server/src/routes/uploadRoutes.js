const express = require('express');
const router = express.Router();
const {
  uploadStudentResume,
  deleteStudentResume,
  getStudentResumeDownload,
  uploadAvatar,
  uploadCompanyLogo
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume, uploadImage } = require('../middleware/upload');

router.use(protect);

// Student Resume endpoints
router.post('/resume', authorize('student'), uploadResume, uploadStudentResume);
router.get('/resume/download', authorize('student'), getStudentResumeDownload);
router.delete('/resume', authorize('student'), deleteStudentResume);

// Universal Avatar endpoint
router.post('/avatar', uploadImage, uploadAvatar);

// Recruiter Company Logo endpoint
router.post('/logo/:companyId', authorize('recruiter', 'admin'), uploadImage, uploadCompanyLogo);

module.exports = router;
