const Interview = require('../models/Interview');
const Application = require('../models/Application');
const RecruiterProfile = require('../models/RecruiterProfile');
const AppError = require('../utils/AppError');
const { createNotification } = require('../services/notificationService');
const { sendInterviewScheduledEmail } = require('../services/emailService');
/**
 * @desc    Schedule a new candidate interview round
 * @route   POST /api/interviews
 * @access  Private (Recruiter)
 */
exports.scheduleInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      title,
      interviewType,
      scheduledDate,
      durationMinutes,
      meetingLink,
      interviewerName,
      notes
    } = req.body;

    if (!applicationId || !scheduledDate || !meetingLink) {
      return next(
        new AppError('Please provide application ID, scheduled date/time, and meeting link.', 400)
      );
    }

    const application = await Application.findById(applicationId)
      .populate('student', 'name email')
      .populate('job', 'title')
      .populate('company', 'name');

    if (!application) {
      return next(new AppError('Application record not found.', 404));
    }

    const recruiter = await RecruiterProfile.findOne({ user: req.user.id });
    if (!recruiter || !recruiter.company) {
      return next(new AppError('Organization profile required.', 400));
    }

    if (application.company._id.toString() !== recruiter.company.toString()) {
      return next(new AppError('Unauthorized: Application does not belong to your company.', 403));
    }

    const interview = await Interview.create({
      application: application._id,
      student: application.student._id,
      recruiter: req.user.id,
      job: application.job._id,
      company: application.company._id,
      title: title || `${interviewType || 'Technical'} Round - ${application.job.title}`,
      interviewType: interviewType || 'Technical',
      scheduledDate,
      durationMinutes: durationMinutes || 45,
      meetingLink,
      interviewerName: interviewerName || req.user.name,
      notes: notes || ''
    });

    application.status = 'INTERVIEW';
    await application.save();

    // 1. In-App Notification
    const io = req.app.get('io');
    await createNotification({
      recipient: application.student._id,
      sender: req.user.id,
      title: 'Interview Scheduled 📅',
      message: `A ${interviewType || 'Technical'} interview has been scheduled for "${application.job.title}".`,
      type: 'INTERVIEW_SCHEDULED',
      link: '/student/interviews',
      io
    });

    // 2. Transactional Email
    sendInterviewScheduledEmail(
      application.student,
      application.job.title,
      application.company.name,
      {
        title: interview.title,
        scheduledDate: interview.scheduledDate,
        durationMinutes: interview.durationMinutes,
        meetingLink: interview.meetingLink,
        notes: interview.notes
      }
    ).catch((err) => console.error('[Interview Email Error]:', err));

    const populatedInterview = await Interview.findById(interview._id)
      .populate('student', 'name email avatar')
      .populate('job', 'title location')
      .populate('company', 'name logo');

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully.',
      data: populatedInterview
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get all scheduled interviews for logged-in student
 * @route   GET /api/interviews/my
 * @access  Private (Student)
 */
exports.getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ student: req.user.id })
      .populate('job', 'title location jobType workMode')
      .populate('company', 'name logo website')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all interviews scheduled by recruiter's organization
 * @route   GET /api/interviews/recruiter
 * @access  Private (Recruiter)
 */
exports.getRecruiterInterviews = async (req, res, next) => {
  try {
    const recruiter = await RecruiterProfile.findOne({ user: req.user.id });
    if (!recruiter || !recruiter.company) {
      return next(new AppError('Organization profile required.', 400));
    }

    const { status, jobId } = req.query;
    const filter = { company: recruiter.company };

    if (status) filter.status = status;
    if (jobId) filter.job = jobId;

    const interviews = await Interview.find(filter)
      .populate('student', 'name email avatar')
      .populate('job', 'title location')
      .populate('company', 'name logo')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update interview status, meeting link, or schedule time
 * @route   PATCH /api/interviews/:id
 * @access  Private (Recruiter)
 */
exports.updateInterview = async (req, res, next) => {
  try {
    const { status, scheduledDate, durationMinutes, meetingLink, notes } = req.body;
    const recruiter = await RecruiterProfile.findOne({ user: req.user.id });

    const interview = await Interview.findById(req.params.id)
      .populate('student', 'name email')
      .populate('job', 'title');

    if (!interview) {
      return next(new AppError('Interview record not found.', 404));
    }

    if (interview.company.toString() !== recruiter.company.toString() && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized: Not authorized for this company.', 403));
    }

    const prevStatus = interview.status;

    if (status) interview.status = status;
    if (scheduledDate) interview.scheduledDate = scheduledDate;
    if (durationMinutes) interview.durationMinutes = durationMinutes;
    if (meetingLink) interview.meetingLink = meetingLink;
    if (notes !== undefined) interview.notes = notes;

    await interview.save();

    // Trigger Notification on Reschedule or Status Change
    if (status && status !== prevStatus) {
      const io = req.app.get('io');
      await createNotification({
        recipient: interview.student._id,
        sender: req.user.id,
        title: `Interview Status: ${status}`,
        message: `Your interview for "${interview.job.title}" has been marked as ${status}.`,
        type: 'INTERVIEW_SCHEDULED',
        link: '/student/interviews',
        io
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interview record updated successfully.',
      data: interview
    });
  } catch (error) {
    next(error);
  }
};