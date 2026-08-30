const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const AppError = require('../utils/AppError');
const { createNotification } = require('../services/notificationService');
const { sendApplicationStatusEmail } = require('../services/emailService');
const { createResumeDownloadUrl } = require('../utils/resumeDownload');
/**
 * @desc    Submit new job application
 * @route   POST /api/applications
 * @access  Private (Student)
 */
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;

    if (!jobId) {
      return next(new AppError('Job identifier is required.', 400));
    }

    const job = await Job.findById(jobId).populate('company', 'name createdBy');
    if (!job) {
      return next(new AppError('Target job posting does not exist.', 404));
    }

    if (job.status !== 'ACTIVE') {
      return next(new AppError('This job posting is no longer accepting applications.', 400));
    }

    if (new Date() > new Date(job.deadline)) {
      return next(new AppError('The application deadline for this job has passed.', 400));
    }

    // Determine final resume link from payload or student profile
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    const finalResume = resumeUrl || studentProfile?.resume?.url || '';

    // Check duplicate application
    const existingApp = await Application.findOne({
      student: req.user.id,
      job: jobId
    });

    if (existingApp) {
      return next(new AppError('You have already applied for this position.', 409));
    }

    const application = await Application.create({
      student: req.user.id,
      job: jobId,
      company: job.company._id,
      coverLetter: coverLetter || '',
      resumeUrl: finalResume,
      status: 'APPLIED'
    });

    // Increment applicant count atomically
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    // Real-Time Notification: Dispatch to Job Poster / Recruiter
    const io = req.app.get('io');
    const recipientRecruiterId = job.postedBy || job.company?.createdBy;

    if (recipientRecruiterId) {
      await createNotification({
        recipient: recipientRecruiterId,
        sender: req.user.id,
        title: 'New Candidate Application 📥',
        message: `${req.user.name} submitted an application for "${job.title}".`,
        type: 'APPLICATION_STATUS',
        link: '/recruiter/applicants',
        io
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('You have already applied for this position.', 409));
    }
    next(error);
  }
};

/**
 * @desc    Check whether student has already applied for a specific job
 * @route   GET /api/applications/check/:jobId
 * @access  Private (Student)
 */
exports.checkApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      student: req.user.id,
      job: req.params.jobId
    }).select('status createdAt');

    res.status(200).json({
      success: true,
      hasApplied: !!application,
      data: application || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications submitted by logged-in student
 * @route   GET /api/applications/my
 * @access  Private (Student)
 */
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate({
        path: 'job',
        select: 'title location jobType workMode experienceLevel salary deadline status company',
        populate: {
          path: 'company',
          select: 'name logo headquarters isVerified'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applicant candidates for a recruiter's company
 * @route   GET /api/applications/recruiter
 * @access  Private (Recruiter, Admin)
 */
exports.getRecruiterApplicants = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'recruiter') {
      const recruiterProfile = await RecruiterProfile.findOne({ user: req.user.id });
      if (!recruiterProfile || !recruiterProfile.company) {
        return next(new AppError('Organization profile required to view candidates.', 400));
      }
      filter.company = recruiterProfile.company;
    }

    const { status, jobId, search } = req.query;
    if (status) filter.status = status;
    if (jobId) filter.job = jobId;

    let applications = await Application.find(filter)
      .populate('student', 'name email avatar')
      .populate('job', 'title location experienceLevel jobType')
      .populate('company', 'name logo')
      .sort({ createdAt: -1 });

    // Enrich with Student profile summary
    const enriched = await Promise.all(
      applications.map(async (appDoc) => {
        const studentProfile = await StudentProfile.findOne({ user: appDoc.student?._id })
          .select('headline skills location phone socialLinks resume');

        return {
          ...appDoc.toObject(),
          studentProfile: studentProfile || null
        };
      })
    );

    // Text search filter
    let finalData = enriched;
    if (search && search.trim()) {
      const s = search.toLowerCase();
      finalData = enriched.filter(
        (a) =>
          a.student?.name?.toLowerCase().includes(s) ||
          a.student?.email?.toLowerCase().includes(s) ||
          a.job?.title?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      success: true,
      count: finalData.length,
      data: finalData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a temporary authorized download link for a candidate resume
 * @route   GET /api/applications/:id/resume-download
 * @access  Private (Recruiter, Admin)
 */
exports.getApplicationResumeDownload = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).select('student company');
    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    if (req.user.role === 'recruiter') {
      const recruiterProfile = await RecruiterProfile.findOne({ user: req.user.id }).select('company');
      if (!recruiterProfile?.company || recruiterProfile.company.toString() !== application.company.toString()) {
        return next(new AppError('You are not authorized to download this resume.', 403));
      }
    }

    const studentProfile = await StudentProfile.findOne({ user: application.student }).select('resume');
    const url = createResumeDownloadUrl(studentProfile?.resume);

    res.status(200).json({
      success: true,
      data: { url }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Advance candidate application status stage
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Recruiter, Admin)
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, recruiterNotes } = req.body;
    const recruiter = await RecruiterProfile.findOne({ user: req.user.id });

    const application = await Application.findById(req.params.id)
      .populate('student', 'name email')
      .populate('job', 'title')
      .populate('company', 'name');

    if (!application) {
      return next(new AppError('Application record not found.', 404));
    }

    if (
      application.company._id.toString() !== recruiter.company.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Unauthorized: Not authorized for this company.', 403));
    }

    const previousStatus = application.status;
    if (status) application.status = status;
    if (recruiterNotes !== undefined) application.recruiterNotes = recruiterNotes;

    await application.save();

    // Trigger Notification & Email if status changed
    if (status && status !== previousStatus) {
      const io = req.app.get('io');

      // 1. In-App Notification
      await createNotification({
        recipient: application.student._id,
        sender: req.user.id,
        title: `Application ${status.replace('_', ' ')}`,
        message: `Your application for "${application.job.title}" at ${application.company.name} is now ${status.replace('_', ' ')}.`,
        type: 'APPLICATION_STATUS',
        link: '/student/applications',
        io
      });

      // 2. Transactional Email
      sendApplicationStatusEmail(
        application.student,
        application.job.title,
        application.company.name,
        status
      ).catch((err) => console.error('[Application Email Error]:', err));
    }

    res.status(200).json({
      success: true,
      message: `Candidate application updated to ${application.status}`,
      data: application
    });
  } catch (error) {
    next(error);
  }
};
