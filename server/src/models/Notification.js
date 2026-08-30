const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user reference is required']
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    type: {
      type: String,
      enum: [
        'APPLICATION_STATUS',
        'INTERVIEW_SCHEDULED',
        'INTERVIEW_UPDATED',
        'JOB_ALERT',
        'SYSTEM_NOTICE'
      ],
      default: 'SYSTEM_NOTICE'
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast user queries & sorting
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);