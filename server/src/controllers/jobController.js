const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
const RecruiterProfile = require('../models/RecruiterProfile');
const StudentProfile = require('../models/StudentProfile');
const AppError = require('../utils/AppError');
const { calculateSkillMatch } = require('../services/skillMatcher');

/**
 * @desc    Discover jobs with faceted filtering, text search, sorting & pagination
 * @route   GET /api/jobs
 * @access  Public
 */
exports.getPublicJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      workMode,
      experienceLevel,
      minSalary,
      sort = 'newest',
      page = 1,
      limit = 10
    } = req.query;

    const query = { status: 'ACTIVE', isApproved: true };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skillsRequired: searchRegex }
      ];
    }

    if (location && location.trim()) {
      query.location = new RegExp(location.trim(), 'i');
    }

    if (jobType) {
      const types = jobType.split(',').map((t) => t.trim());
      query.jobType = { $in: types };
    }

    if (workMode) {
      const modes = workMode.split(',').map((m) => m.trim());
      query.workMode = { $in: modes };
    }

    if (experienceLevel) {
      const levels = experienceLevel.split(',').map((l) => l.trim());
      query.experienceLevel = { $in: levels };
    }

    if (minSalary && !isNaN(minSalary)) {
      query['salary.max'] = { $gte: Number(minSalary) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'salary_high') sortOption = { 'salary.max': -1 };
    else if (sort === 'salary_low') sortOption = { 'salary.min': 1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company', 'name logo headquarters industry isVerified')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Optional student skill scoring
    let studentSkills = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'hireflow_test_jwt_secret_key_1234567890'
        );
        if (decoded && decoded.role === 'student') {
          const profile = await StudentProfile.findOne({ user: decoded.id }).select('skills');
          if (profile) studentSkills = profile.skills;
        }
      } catch {
        // Continue unauthenticated if token invalid
      }
    }

    const scoredJobs = jobs.map((job) => {
      const jobObj = job.toObject();
      if (studentSkills) {
        const matchData = calculateSkillMatch(studentSkills, job.skillsRequired);
        jobObj.skillMatch = matchData.score;
      }
      return jobObj;
    });

    res.status(200).json({
      success: true,
      count: scoredJobs.length,
      pagination: {
        total: totalJobs,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalJobs / limitNum) || 1
      },
      data: scoredJobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private (Recruiter)
 */
exports.createJob = async (req, res, next) => {
  try {
    const recruiter = await RecruiterProfile.findOne({ user: req.user.id });

    if (!recruiter || !recruiter.company) {
      return next(
        new AppError(
          'Please complete your organization profile before posting jobs.',
          400
        )
      );
    }

    const {
      title,
      description,
      responsibilities,
      requirements,
      skillsRequired,
      jobType,
      workMode,
      experienceLevel,
      location,
      salary,
      openings,
      deadline
    } = req.body;

    if (!title || !description || !location || !deadline) {
      return next(new AppError('Please fill in all mandatory job fields.', 400));
    }

    let processedSkills = [];
    if (Array.isArray(skillsRequired)) {
      processedSkills = [
        ...new Set(
          skillsRequired.map((s) => s.trim().toLowerCase()).filter(Boolean)
        )
      ];
    }

    if (processedSkills.length === 0) {
      return next(new AppError('Please provide at least one required skill.', 400));
    }

    const job = await Job.create({
      title,
      company: recruiter.company,
      postedBy: req.user.id,
      description,
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities.filter(Boolean)
        : [],
      requirements: Array.isArray(requirements)
        ? requirements.filter(Boolean)
        : [],
      skillsRequired: processedSkills,
      jobType,
      workMode,
      experienceLevel,
      location,
      salary,
      openings: openings || 1,
      deadline
    });

    const populatedJob = await Job.findById(job._id).populate(
      'company',
      'name logo headquarters industry isVerified'
    );

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: populatedJob
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs posted by the authenticated recruiter
 * @route   GET /api/jobs/my/listings
 * @access  Private (Recruiter)
 */
exports.getMyJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { postedBy: req.user.id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company', 'name logo headquarters')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job details by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo description website headquarters industry isVerified')
      .populate('postedBy', 'name email avatar');

    if (!job) {
      return next(new AppError('Job listing not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job listing (Restricted to owner or admin)
 * @route   PUT /api/jobs/:id
 * @access  Private (Recruiter/Admin)
 */
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job listing not found.', 404));
    }

    if (
      job.postedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new AppError('Unauthorized: You can only edit your own job postings.', 403)
      );
    }

    if (req.body.skillsRequired && Array.isArray(req.body.skillsRequired)) {
      req.body.skillsRequired = [
        ...new Set(
          req.body.skillsRequired.map((s) => s.trim().toLowerCase()).filter(Boolean)
        )
      ];
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('company', 'name logo headquarters');

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle job status (ACTIVE <-> CLOSED)
 * @route   PATCH /api/jobs/:id/status
 * @access  Private (Recruiter/Admin)
 */
exports.toggleJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job listing not found.', 404));
    }

    if (
      job.postedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Unauthorized.', 403));
    }

    job.status = job.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job status updated to ${job.status}`,
      status: job.status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job listing
 * @route   DELETE /api/jobs/:id
 * @access  Private (Recruiter/Admin)
 */
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job listing not found.', 404));
    }

    if (
      job.postedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Unauthorized.', 403));
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
