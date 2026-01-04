const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

// Apply rate limiting
const rateLimit = require('express-rate-limit');
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 email requests per windowMs
  message: {
    success: false,
    message: 'Too many email requests. Please try again after 15 minutes.',
    code: 'EMAIL_RATE_LIMIT_EXCEEDED'
  }
});

// Apply to all email routes
router.use(emailLimiter);

// Test email service
router.get('/test', emailController.testEmail);

// Check email connection
router.get('/check', emailController.checkConnection);

// Get email statistics
router.get('/stats', emailController.getEmailStats);

// Reset email statistics
router.delete('/stats/reset', emailController.resetEmailStats);

// Send custom email
router.post('/send', emailController.sendCustomEmail);

// Send bulk emails
router.post('/send/bulk', emailController.sendBulkEmails);

module.exports = router;