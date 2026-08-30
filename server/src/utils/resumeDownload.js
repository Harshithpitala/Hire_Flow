const path = require('path');
const cloudinary = require('../config/cloudinary');
const AppError = require('./AppError');

const supportedFormats = new Set(['pdf', 'doc', 'docx']);

/**
 * Creates a short-lived, signed Cloudinary download URL for a resume.
 * Public Cloudinary PDF delivery can be restricted on some accounts, whereas
 * this URL is created only after the application has authorized the user.
 */
const createResumeDownloadUrl = (resume) => {
  if (!resume?.publicId) {
    throw new AppError('No resume has been uploaded.', 404);
  }

  const format = path
    .extname(resume.fileName || resume.publicId)
    .slice(1)
    .toLowerCase();

  if (!supportedFormats.has(format)) {
    throw new AppError('This resume has an unsupported file format.', 400);
  }

  return cloudinary.utils.private_download_url(resume.publicId, format, {
    resource_type: 'raw',
    type: 'upload',
    attachment: true,
    expires_at: Math.floor(Date.now() / 1000) + 5 * 60
  });
};

module.exports = { createResumeDownloadUrl };
