const jwt = require('jsonwebtoken');

const users = []; // In-memory user storage (replace with a database in production)

// Secret key for JWT (store this in an environment variable in production)
const JWT_SECRET = 'your_jwt_secret_key';

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate password strength
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Helper function to validate name
const isValidName = (name) => {
  const nameRegex = /^[A-Za-z\s]{2,50}$/;
  return nameRegex.test(name);
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' } // Token expires in 1 hour
  );
};

const signup = (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    // Validate name
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!isValidName(name)) {
      return res.status(400).json({ 
        message: 'Invalid name. Name should be 2-50 characters long and contain only letters and spaces' 
      });
    }

    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' 
      });
    }

    // Validate confirmPassword
    if (!confirmPassword) {
      return res.status(400).json({ message: 'Confirm password is required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user (in production, hash the password using bcrypt)
    const newUser = { id: users.length + 1, name, email, password };
    users.push(newUser);

    // Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json({ 
      message: 'User created successfully', 
      user: { id: newUser.id, name, email },
      token
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'An unexpected error occurred during signup', 
      error: error.message 
    });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password (in production, compare hashed passwords using bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({ 
      message: 'Login successful', 
      user: { id: user.id, name: user.name, email },
      token
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'An unexpected error occurred during login', 
      error: error.message 
    });
  }
};

module.exports = { signup, login };