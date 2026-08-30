const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    designation: {
      type: String,
      trim: true,
      default: 'Technical Recruiter'
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    linkedin: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);