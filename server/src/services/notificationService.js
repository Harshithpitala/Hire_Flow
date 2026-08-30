const Notification = require('../models/Notification');

/**
 * Creates a persistent notification in MongoDB and pushes real-time WebSocket packet.
 * @param {Object} data
 * @param {string} data.recipient - Target User ObjectId
 * @param {string} [data.sender] - Triggering User ObjectId (optional)
 * @param {string} data.title - Short alert header
 * @param {string} data.message - Detailed alert message
 * @param {string} [data.type] - Notification enum type
 * @param {string} [data.link] - Client-side destination route
 * @param {Object} [io] - Optional Express app.get('io') instance
 */
const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = 'SYSTEM_NOTICE',
  link = '',
  io = null
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      link
    });

    // If io instance is provided or globally stored, emit real-time event
    const activeIo = io || (global.ioInstance ? global.ioInstance : null);

    if (activeIo) {
      const targetRoom = `user_${recipient.toString()}`;
      activeIo.to(targetRoom).emit('new_notification', notification);
      console.log(`[Socket.IO] Pushed real-time notification to room: ${targetRoom}`);
    }

    return notification;
  } catch (error) {
    console.error('[NotificationService Error]:', error.message);
    return null;
  }
};

module.exports = { createNotification };