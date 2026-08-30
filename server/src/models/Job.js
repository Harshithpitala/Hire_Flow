const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Job title cannot exceed 120 characters']
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company association is required']
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User association is required']
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [10000, 'Description cannot exceed 10000 characters']
    },
    responsibilities: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    skillsRequired: [
      {
        type: String,
        trim: true,
        lowercase: true,
        required: true
      }
    ],
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      default: 'Full-time'
    },
    workMode: {
      type: String,
      required: [true, 'Work mode is required'],
      enum: ['On-site', 'Hybrid', 'Remote'],
      default: 'On-site'
    },
    experienceLevel: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['Fresher / Entry-Level', '1-3 Years', '3-5 Years', '5+ Years'],
      default: 'Fresher / Entry-Level'
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      isNegotiable: { type: Boolean, default: false }
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Openings must be at least 1']
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required']
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED', 'DRAFT', 'ARCHIVED'],
      default: 'ACTIVE'
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    applicantCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound Indexing for Search & Fast Aggregations
jobSchema.index({ title: 'text', description: 'text', location: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1, postedBy: 1 });
jobSchema.index({ skillsRequired: 1 });

module.exports = mongoose.model('Job', jobSchema);