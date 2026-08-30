const AppError = require('../utils/AppError');

/**
 * Validates request payload for creating/updating a job posting
 */
const validateJobPayload = (req, res, next) => {
  const {
    title,
    description,
    location,
    jobType,
    workMode,
    experienceLevel,
    deadline,
    skillsRequired
  } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return next(new AppError('Job title must be at least 3 characters long.', 400));
  }

  if (!description || typeof description !== 'string' || description.trim().length < 20) {
    return next(new AppError('Job description must be at least 20 characters long.', 400));
  }

  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    return next(new AppError('Please provide a valid location.', 400));
  }

  const validJobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];
  if (jobType && !validJobTypes.includes(jobType)) {
    return next(new AppError(`Invalid job type. Must be one of: ${validJobTypes.join(', ')}`, 400));
  }

  const validWorkModes = ['On-site', 'Hybrid', 'Remote'];
  if (workMode && !validWorkModes.includes(workMode)) {
    return next(new AppError(`Invalid work mode. Must be one of: ${validWorkModes.join(', ')}`, 400));
  }

  const validExperience = ['Fresher / Entry-Level', '1-3 Years', '3-5 Years', '5+ Years'];
  if (experienceLevel && !validExperience.includes(experienceLevel)) {
    return next(new AppError(`Invalid experience level. Must be one of: ${validExperience.join(', ')}`, 400));
  }

  if (!deadline || isNaN(Date.parse(deadline))) {
    return next(new AppError('Please provide a valid application deadline date.', 400));
  }

  if (new Date(deadline) <= new Date()) {
    return next(new AppError('The application deadline must be set to a future date.', 400));
  }

  if (!skillsRequired || !Array.isArray(skillsRequired) || skillsRequired.length === 0) {
    return next(new AppError('Please provide at least one required technical skill.', 400));
  }

  next();
};

module.exports = { validateJobPayload };