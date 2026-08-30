const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [160, 'Tagline cannot exceed 160 characters'],
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Company overview / description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    industry: {
      type: String,
      required: [true, 'Industry type is required'],
      enum: [
        'Information Technology & Services',
        'Financial Technology (FinTech)',
        'Software Development',
        'Healthcare & Life Sciences',
        'E-Commerce & Retail',
        'Artificial Intelligence & Data',
        'Telecommunications',
        'Consulting & Professional Services',
        'Education Technology (EdTech)',
        'Other'
      ],
      default: 'Software Development'
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      default: '11-50'
    },
    headquarters: {
      type: String,
      required: [true, 'Headquarters location is required'],
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Company', companySchema);