const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authMiddleware.validateRegistration, authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware.protect, authController.getProfile);

module.exports = router;