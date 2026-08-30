const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required']
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required']
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required']
    },
    status: {
      type: String,
      enum: [
        'APPLIED',
        'UNDER_REVIEW',
        'SHORTLISTED',
        'ASSESSMENT',
        'INTERVIEW',
        'SELECTED',
        'REJECTED',
        'WITHDRAWN'
      ],
      default: 'APPLIED'
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
      default: ''
    },
    resumeUrl: {
      type: String,
      default: ''
    },
    recruiterNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate applications by the same student for the same job
applicationSchema.index({ student: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ company: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);