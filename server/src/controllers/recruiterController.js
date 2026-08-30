const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Interview = require('../models/Interview');

/**
 * @desc    Get current recruiter and company profile details
 * @route   GET /api/recruiters/profile/me
 * @access  Private (Recruiter)
 */
exports.getMyRecruiterProfile = async (req, res, next) => {
  try {
    let recruiterProfile = await RecruiterProfile.findOne({ user: req.user.id })
      .populate('user', 'name email avatar isVerified')
      .populate('company');

    // Auto-create recruiter record if accessing for the first time
    if (!recruiterProfile) {
      recruiterProfile = await RecruiterProfile.create({
        user: req.user.id
      });
      recruiterProfile = await recruiterProfile.populate('user', 'name email avatar isVerified');
    }

    res.status(200).json({
      success: true,
      data: recruiterProfile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update recruiter personal details and designation
 * @route   PUT /api/recruiters/profile
 * @access  Private (Recruiter)
 */
exports.updateRecruiterProfile = async (req, res, next) => {
  try {
    const { name, designation, phone, linkedin } = req.body;

    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name }, { runValidators: true });
    }

    const updatedProfile = await RecruiterProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: { designation, phone, linkedin } },
      { new: true, upsert: true, runValidators: true }
    )
      .populate('user', 'name email avatar isVerified')
      .populate('company');

    res.status(200).json({
      success: true,
      message: 'Recruiter profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update organization/company profile
 * @route   POST /api/recruiters/company
 * @access  Private (Recruiter)
 */
exports.saveCompanyProfile = async (req, res, next) => {
  try {
    const {
      name,
      tagline,
      description,
      website,
      industry,
      companySize,
      headquarters,
      logo
    } = req.body;

    if (!name || !description || !headquarters) {
      return next(new AppError('Please provide company name, description, and headquarters', 400));
    }

    let recruiter = await RecruiterProfile.findOne({ user: req.user.id });
    if (!recruiter) {
      recruiter = await RecruiterProfile.create({ user: req.user.id });
    }

    let company;

    if (recruiter.company) {
      // Update existing company linked to this recruiter
      company = await Company.findByIdAndUpdate(
        recruiter.company,
        {
          name,
          tagline,
          description,
          website,
          industry,
          companySize,
          headquarters,
          logo
        },
        { new: true, runValidators: true }
      );
    } else {
      // Check for name collision
      const existingCompany = await Company.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
      if (existingCompany) {
        // Associate recruiter with existing company record
        company = existingCompany;
      } else {
        // Create brand new company document
        company = await Company.create({
          name,
          tagline,
          description,
          website,
          industry,
          companySize,
          headquarters,
          logo,
          createdBy: req.user.id
        });
      }

      recruiter.company = company._id;
      await recruiter.save();
    }

    const populatedRecruiter = await RecruiterProfile.findById(recruiter._id)
      .populate('user', 'name email avatar isVerified')
      .populate('company');

    res.status(200).json({
      success: true,
      message: 'Company profile synchronized successfully',
      data: populatedRecruiter
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public company details by Company ID
 * @route   GET /api/recruiters/company/:id
 * @access  Public
 */
exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recruitment analytics & candidate funnel conversion metrics
 * @route   GET /api/recruiters/analytics
 * @access  Private (Recruiter)
 */
exports.getRecruiterAnalytics = async (req, res, next) => {
  try {
    const recruiter = await RecruiterProfile.findOne({ user: req.user.id });
    if (!recruiter || !recruiter.company) {
      return next(new AppError('Please configure your organization profile to access analytics.', 400));
    }

    const companyId = new mongoose.Types.ObjectId(recruiter.company);

    // 1. Aggregation: Pipeline Stage Breakdown & Conversion Counts
    const stageMetrics = await Application.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stages into structured key-value map
    const stageCounts = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      ASSESSMENT: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0
    };

    let totalApplications = 0;
    stageMetrics.forEach((item) => {
      if (stageCounts[item._id] !== undefined) {
        stageCounts[item._id] = item.count;
      }
      totalApplications += item.count;
    });

    // 2. Aggregation: Per-Job Performance and Applicant Metrics
    const jobPerformance = await Job.aggregate([
      { $match: { company: companyId } },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications'
        }
      },
      {
        $project: {
          title: 1,
          jobType: 1,
          workMode: 1,
          status: 1,
          applicantCount: { $size: '$applications' },
          selectedCount: {
            $size: {
              $filter: {
                input: '$applications',
                as: 'app',
                cond: { $eq: ['$$app.status', 'SELECTED'] }
              }
            }
          },
          createdAt: 1
        }
      },
      { $sort: { applicantCount: -1 } }
    ]);

    // 3. Total Scheduled Interviews
    const totalInterviews = await Interview.countDocuments({ company: companyId });

    // 4. Conversion Rates
    const shortlistRate = totalApplications > 0 
      ? Math.round(((stageCounts.SHORTLISTED + stageCounts.INTERVIEW + stageCounts.SELECTED) / totalApplications) * 100) 
      : 0;

    const selectionRate = totalApplications > 0 
      ? Math.round((stageCounts.SELECTED / totalApplications) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        totalInterviews,
        shortlistRate,
        selectionRate,
        funnel: stageCounts,
        jobPerformance
      }
    });
  } catch (error) {
    next(error);
  }
};