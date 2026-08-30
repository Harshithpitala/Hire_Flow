const express = require('express');
const router = express.Router();
const {
  getPublicJobs,
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  toggleJobStatus,
  deleteJob
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const { validateJobPayload } = require('../validators/jobValidator');

// Public discovery
router.get('/', getPublicJobs);

// This fixed path must be registered before /:id, otherwise "my" is
// interpreted as a MongoDB ObjectId and recruiter listings cannot load.
router.get('/my/listings', protect, authorize('recruiter'), getMyJobs);
router.get('/:id', getJobById);

// Recruiter routes with payload validation
router.post('/', protect, authorize('recruiter'), validateJobPayload, createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), toggleJobStatus);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
