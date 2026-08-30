const cloudinary = require('../config/cloudinary');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const User = require('../models/User');
const Application = require('../models/Application');
const AppError = require('../utils/AppError');
const { createResumeDownloadUrl } = require('../utils/resumeDownload');

const resumeExtensions = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
};

/**
 * Helper to upload buffer to Cloudinary using stream
 */
const uploadStreamToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    stream.end(buffer);
  });
};

/**
 * @desc    Upload / Replace Student Resume
 * @route   POST /api/upload/resume
 * @access  Private (Student)
 */
exports.uploadStudentResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please select a resume file to upload.', 400));
    }

    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await StudentProfile.create({ user: req.user.id });
    }

    const previousPublicId = profile.resume?.publicId;

    // Resumes are documents, not images. Raw uploads preserve PDF/Word content
    // and require the file extension to be included in the public ID.
    const extension = resumeExtensions[req.file.mimetype];
    const result = await uploadStreamToCloudinary(req.file.buffer, {
      folder: 'hireflow/resumes',
      resource_type: 'raw',
      public_id: `resume_${req.user.id}_${Date.now()}${extension}`
    });

    // Delete the previous asset only after its replacement has uploaded.
    // The image request handles resumes uploaded before this raw-file fix.
    if (previousPublicId && previousPublicId !== result.public_id) {
      await Promise.allSettled([
        cloudinary.uploader.destroy(previousPublicId, { resource_type: 'raw' }),
        cloudinary.uploader.destroy(previousPublicId, { resource_type: 'image' })
      ]);
    }

    profile.resume = {
      url: result.secure_url,
      publicId: result.public_id,
      fileName: req.file.originalname,
      uploadedAt: new Date()
    };

    await profile.save();
    await Application.updateMany(
      { student: req.user.id },
      { $set: { resumeUrl: profile.resume.url } }
    );

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      data: profile.resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Student Resume
 * @route   DELETE /api/upload/resume
 * @access  Private (Student)
 */
exports.deleteStudentResume = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile || !profile.resume?.publicId) {
      return next(new AppError('No resume found to delete.', 404));
    }

    await Promise.allSettled([
      cloudinary.uploader.destroy(profile.resume.publicId, { resource_type: 'raw' }),
      cloudinary.uploader.destroy(profile.resume.publicId, { resource_type: 'image' })
    ]);

    profile.resume = {
      url: '',
      publicId: '',
      fileName: '',
      uploadedAt: null
    };

    await profile.save();
    await Application.updateMany(
      { student: req.user.id },
      { $set: { resumeUrl: '' } }
    );

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload User Avatar
 * @route   POST /api/upload/avatar
 * @access  Private
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please select an image file to upload.', 400));
    }

    const result = await uploadStreamToCloudinary(req.file.buffer, {
      folder: 'hireflow/avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully.',
      avatarUrl: user.avatar
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload Company Logo
 * @route   POST /api/upload/logo/:companyId
 * @access  Private (Recruiter/Admin)
 */
exports.uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please select a company logo image to upload.', 400));
    }

    const result = await uploadStreamToCloudinary(req.file.buffer, {
      folder: 'hireflow/logos',
      transformation: [{ width: 250, height: 250, crop: 'fit' }]
    });

    const company = await Company.findByIdAndUpdate(
      req.params.companyId,
      { logo: result.secure_url },
      { new: true }
    );

    if (!company) {
      return next(new AppError('Company record not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Company logo updated successfully.',
      logoUrl: company.logo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a temporary authorized download link for the current student's resume
 * @route   GET /api/upload/resume/download
 * @access  Private (Student)
 */
exports.getStudentResumeDownload = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id }).select('resume');
    const url = createResumeDownloadUrl(profile?.resume);

    res.status(200).json({
      success: true,
      data: { url }
    });
  } catch (error) {
    next(error);
  }
};
