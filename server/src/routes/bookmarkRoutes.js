const express = require('express');
const router = express.Router();
const {
  toggleBookmark,
  getMyBookmarks,
  getMyBookmarkIds
} = require('../controllers/bookmarkController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('student'));

router.post('/toggle/:jobId', toggleBookmark);
router.get('/my', getMyBookmarks);
router.get('/ids', getMyBookmarkIds);

module.exports = router;