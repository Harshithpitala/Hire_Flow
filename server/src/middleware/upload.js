const multer = require('multer');
const AppError = require('../utils/AppError');

// Store file in memory as Buffer rather than writing to disk
const storage = multer.memoryStorage();

// File filter for Resumes (PDF, DOC, DOCX)
const resumeFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type! Please upload a PDF or Word document (.pdf, .doc, .docx).', 400), false);
  }
};

// File filter for Images / Logos (JPEG, PNG, WEBP)
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type! Please upload an image (.png, .jpg, .jpeg, .webp).', 400), false);
  }
};

const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: resumeFilter
}).single('resume');

const uploadImage = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB max
  fileFilter: imageFilter
}).single('image');

module.exports = { uploadResume, uploadImage };