const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { calculateSkillMatch } = require('../services/skillMatcher');
/**
 * @desc    Get current student's profile
 * @route   GET /api/students/profile/me
 * @access  Private (Student)
 */
exports.getMyProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user.id }).populate(
      'user',
      'name email avatar isVerified createdAt'
    );

    // Initialize an empty profile document if this is the first visit
    if (!profile) {
      profile = await StudentProfile.create({
        user: req.user.id,
        skills: [],
        education: [],
        experience: [],
        projects: []
      });
      profile = await profile.populate('user', 'name email avatar isVerified createdAt');
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update student profile details
 * @route   PUT /api/students/profile
 * @access  Private (Student)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      headline,
      phone,
      location,
      bio,
      skills,
      education,
      experience,
      projects,
      certifications,
      socialLinks,
      name
    } = req.body;

    // 1. If name is passed, update corresponding User document
    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name }, { runValidators: true });
    }

    // 2. Normalize skills array (remove empty strings and deduplicate)
    let processedSkills = [];
    if (Array.isArray(skills)) {
      processedSkills = [...new Set(skills.map((s) => s.trim().toLowerCase()).filter(Boolean))];
    }

    const profileData = {
      headline,
      phone,
      location,
      bio,
      skills: processedSkills,
      education: education || [],
      experience: experience || [],
      projects: projects || [],
      certifications: certifications || [],
      socialLinks: socialLinks || {}
    };

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileData },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email avatar isVerified createdAt');

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get any student's public profile by User ID
 * @route   GET /api/students/profile/:userId
 * @access  Private (Authenticated users)
 */
exports.getStudentProfileById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.params.userId }).populate(
      'user',
      'name email avatar isVerified createdAt'
    );

    if (!profile) {
      return next(new AppError('Student profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Evaluate smart skill match against a specific job
 * @route   GET /api/students/match/:jobId
 * @access  Private (Student)
 */
exports.evaluateJobMatch = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId).select('title skillsRequired company');
    if (!job) {
      return next(new AppError('Job opening not found.', 404));
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id }).select('skills');
    const studentSkills = studentProfile ? studentProfile.skills : [];

    const matchResult = calculateSkillMatch(studentSkills, job.skillsRequired);

    res.status(200).json({
      success: true,
      data: {
        jobId: job._id,
        jobTitle: job.title,
        ...matchResult
      }
    });
  } catch (error) {
    next(error);
  }
};