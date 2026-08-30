const Bookmark = require('../models/Bookmark');
const Job = require('../models/Job');
const AppError = require('../utils/AppError');

/**
 * @desc    Toggle Bookmark (Save or Unsave a Job)
 * @route   POST /api/bookmarks/toggle/:jobId
 * @access  Private (Student)
 */
exports.toggleBookmark = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job posting not found', 404));
    }

    const existingBookmark = await Bookmark.findOne({
      student: req.user.id,
      job: jobId
    });

    if (existingBookmark) {
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      return res.status(200).json({
        success: true,
        bookmarked: false,
        message: 'Job removed from your saved list.'
      });
    }

    await Bookmark.create({
      student: req.user.id,
      job: jobId
    });

    res.status(201).json({
      success: true,
      bookmarked: true,
      message: 'Job successfully saved to your bookmarks.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all saved jobs for current student
 * @route   GET /api/bookmarks/my
 * @access  Private (Student)
 */
exports.getMyBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ student: req.user.id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo location industry'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get array of saved job IDs (for quick icon state lookups)
 * @route   GET /api/bookmarks/ids
 * @access  Private (Student)
 */
exports.getMyBookmarkIds = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ student: req.user.id }).select('job');
    const ids = bookmarks.map((b) => b.job.toString());

    res.status(200).json({
      success: true,
      data: ids
    });
  } catch (error) {
    next(error);
  }
};