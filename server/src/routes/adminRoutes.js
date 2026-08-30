const express = require('express');
const router = express.Router();
const {
  getPlatformOverview,
  getAllUsers,
  toggleUserStatus,
  getAllCompanies,
  toggleCompanyVerification,
  getAllJobsAdmin,
  getAdminPlatformAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/overview', getPlatformOverview);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/companies', getAllCompanies);
router.patch('/companies/:id/verify', toggleCompanyVerification);
router.get('/jobs', getAllJobsAdmin);
router.get('/analytics', getAdminPlatformAnalytics);

module.exports = router;