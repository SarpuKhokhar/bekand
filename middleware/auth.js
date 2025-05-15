// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Temporary fallback for testing
  const secret = process.env.JWT_SECRET || 'temporary_secret_12345_for_testing';
  if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not defined in environment variables. Using temporary fallback secret.');
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Add decoded user info to request
    next();
  } catch (err) {
    console.error('Token verification error:', err.message, err.stack);
    return res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }
};

module.exports = { verifyToken };