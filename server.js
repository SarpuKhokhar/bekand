// server.js
const dotenv = require('dotenv');
const path = require('path');

// Load .env file with explicit path
const envPath = path.resolve(__dirname, '.env');
const dotenvResult = dotenv.config({ path: envPath });

// Debug: Check if .env loaded successfully
if (dotenvResult.error) {
  console.error('Error loading .env file:', dotenvResult.error.message);
} else {
  console.log('Successfully loaded .env file');
}

// Debug: Log environment variables
console.log('Environment Variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db'); // Updated path
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});