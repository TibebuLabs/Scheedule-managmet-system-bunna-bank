const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller');
const { protect, validateRegistration } = require('../middleware/auth.middleware');

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is running 🚀',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile'
    }
  });
});

// Register route
router.post('/register', validateRegistration, register);

// Login route
router.post('/login', login);

// Profile route (protected)
router.get('/profile', protect, getProfile);

module.exports = router;