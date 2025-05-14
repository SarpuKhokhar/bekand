const express = require('express');
const router = express.Router();
const auth = require('../models/auth');

// POST /api/auth/signup
router.post('/signup', auth.signup);

// POST /api/auth/login
router.post('/login', auth.login);

module.exports = router;