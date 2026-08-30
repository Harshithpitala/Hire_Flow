const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const AppError = require('../utils/AppError');

/**
 * @desc    Get high-level platform statistics
 * @route   GET /api/admin/overview
 * @access  Private (Admin)
 */
exports.getPlatformOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalCompanies,
      pendingCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      selectedApplications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'recruiter' }),
      Company.countDocuments(),
      Company.countDocuments({ isVerified: false }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'ACTIVE' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'SELECTED' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          recruiters: totalRecruiters
        },
        companies: {
          total: totalCompanies,
          pendingVerification: pendingCompanies
        },
        jobs: {
          total: totalJobs,
          active: activeJobs
        },
        applications: {
          total: totalApplications,
          placements: selectedApplications
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all platform users with filtering & search
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && ['student', 'recruiter', 'admin'].includes(role)) {
      query.role = role;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user account active status (Deactivate / Reactivate)
 * @route   PATCH /api/admin/users/:id/toggle-status
 * @access  Private (Admin)
 */
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (user._id.toString() === req.user.id) {
      return next(new AppError('You cannot deactivate your own administrative account.', 400));
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: {
        _id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all registered companies for verification
 * @route   GET /api/admin/companies
 * @access  Private (Admin)
 */
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { isVerified, search } = req.query;
    const query = {};

    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { industry: regex }, { headquarters: regex }];
    }

    const companies = await Company.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify or unverify a company
 * @route   PATCH /api/admin/companies/:id/verify
 * @access  Private (Admin)
 */
exports.toggleCompanyVerification = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new AppError('Company not found.', 404));
    }

    company.isVerified = !company.isVerified;
    await company.save();

    res.status(200).json({
      success: true,
      message: `Company status updated to: ${company.isVerified ? 'VERIFIED' : 'UNVERIFIED'}.`,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs for moderation
 * @route   GET /api/admin/jobs
 * @access  Private (Admin)
 */
exports.getAllJobsAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { location: regex }];
    }

    const jobs = await Job.find(query)
      .populate('company', 'name logo isVerified headquarters')
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get monthly user growth, job posting velocity, and industry distribution
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
exports.getAdminPlatformAnalytics = async (req, res, next) => {
  try {
    // 1. Monthly User Registration Trends (Past 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userRegistrationTrends = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          students: {
            $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
          },
          recruiters: {
            $sum: { $cond: [{ $eq: ['$role', 'recruiter'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 2. Jobs Distribution by Industry
    const industryDistribution = await Company.aggregate([
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 3. Application Funnel Totals Platform-wide
    const platformFunnel = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const funnelMap = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0
    };

    let totalPlacements = 0;
    platformFunnel.forEach((item) => {
      if (funnelMap[item._id] !== undefined) {
        funnelMap[item._id] = item.count;
      }
      if (item._id === 'SELECTED') {
        totalPlacements = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        userRegistrationTrends,
        industryDistribution,
        platformFunnel: funnelMap,
        totalPlacements
      }
    });
  } catch (error) {
    next(error);
  }
};