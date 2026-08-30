const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index prevents duplicate saves by the same candidate
bookmarkSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);