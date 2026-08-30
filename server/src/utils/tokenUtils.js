const jwt = require('jsonwebtoken');

/**
 * Generates signed JWT token for a user
 */
const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'hireflow_test_jwt_secret_key_1234567890';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id, role }, secret, { expiresIn });
};

/**
 * Standardized Auth Response Payload
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id, user.role);

  const userPayload = {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive !== undefined ? user.isActive : true
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userPayload
  });
};

module.exports = {
  generateToken,
  sendTokenResponse
};