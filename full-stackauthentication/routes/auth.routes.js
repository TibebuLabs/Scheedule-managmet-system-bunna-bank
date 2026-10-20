const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { registerSchema, loginSchema, validate } = require('../validators/auth.validator');

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

// Register route with Joi validation
router.post('/register', validate(registerSchema), register);

// Login route with Joi validation
router.post('/login', validate(loginSchema), login);

// Profile route (protected)
router.get('/profile', protect, getProfile);

module.exports = router;