const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'recruiter', 'admin'],
      default: 'student'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetPasswordOtp: String,
    resetPasswordOtpExpires: Date
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT Token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'hireflow_test_jwt_secret_key_1234567890',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// Password Reset Hex Token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Password Reset 6-Digit OTP
userSchema.methods.createPasswordResetOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordOtp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');
  this.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

module.exports = mongoose.model('User', userSchema);
