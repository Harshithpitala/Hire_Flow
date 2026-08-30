const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: [true, 'Institution name is required'], trim: true },
  degree: { type: String, required: [true, 'Degree is required'], trim: true },
  fieldOfStudy: { type: String, trim: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number },
  gradeOrCgpa: { type: String, trim: true }
});

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Job title is required'], trim: true },
  company: { type: String, required: [true, 'Company name is required'], trim: true },
  location: { type: String, trim: true },
  startDate: { type: String, required: true },
  endDate: { type: String, default: 'Present' },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, trim: true }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Project title is required'], trim: true },
  description: { type: String, required: [true, 'Project description is required'], trim: true },
  technologies: [{ type: String, trim: true }],
  liveUrl: { type: String, trim: true },
  githubUrl: { type: String, trim: true }
});

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [120, 'Headline cannot exceed 120 characters'],
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: ''
    },
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    certifications: [
      {
        title: { type: String, trim: true },
        issuer: { type: String, trim: true },
        issueDate: { type: String },
        credentialUrl: { type: String, trim: true }
      }
    ],
    socialLinks: {
      github: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      portfolio: { type: String, trim: true, default: '' }
    },
    resume: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      fileName: { type: String, default: '' },
      uploadedAt: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);