const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all notifications for authenticated user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getMyNotifications = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return next(new AppError('Notification not found.', 404));
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all unread notifications as read for current user
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return next(new AppError('Notification not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};