const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;