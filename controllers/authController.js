const users = []; // In-memory user storage (replace with a database in production)

const signup = (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Basic validation
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create new user (in production, hash the password using bcrypt)
  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);

  return res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, name, email } });
};

const login = (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
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

  return res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email } });
};

module.exports = { signup, login };