// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'temporary_secret_12345_for_testing';
  if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not defined in environment variables. Using temporary fallback secret.');
  }
  return jwt.sign(
    { id: user._id, email: user.email },
    secret,
    { expiresIn: '1h' }
  );
};

const signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields (name, email, password, confirmPassword) are required' });
    }

    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ message: 'Name must be a string between 2 and 50 characters' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({ name: name.trim(), email: email.toLowerCase(), password });
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    return res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error.message, error.stack);
    return res.status(500).json({
      message: 'An error occurred during signup',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    return res.status(500).json({
      message: 'An error occurred during login',
      error: error.message,
    });
  }
};

module.exports = { signup, login };