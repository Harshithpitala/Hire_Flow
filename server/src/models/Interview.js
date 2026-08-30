const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application association is required']
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student association is required']
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter association is required']
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job association is required']
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company association is required']
    },
    title: {
      type: String,
      required: [true, 'Interview title or topic is required'],
      trim: true
    },
    interviewType: {
      type: String,
      enum: ['Technical', 'HR', 'Managerial', 'Assessment', 'Other'],
      default: 'Technical'
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date and time is required']
    },
    durationMinutes: {
      type: Number,
      default: 45,
      min: [15, 'Duration must be at least 15 minutes']
    },
    meetingLink: {
      type: String,
      required: [true, 'Meeting link (Google Meet / Zoom / Teams) is required'],
      trim: true
    },
    interviewerName: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
      default: 'SCHEDULED'
    }
  },
  {
    timestamps: true
  }
);

interviewSchema.index({ student: 1, scheduledDate: 1 });
interviewSchema.index({ company: 1, scheduledDate: 1 });
interviewSchema.index({ application: 1 });

module.exports = mongoose.model('Interview', interviewSchema);