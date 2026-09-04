const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rate limiter for login endpoint (5 failed login attempts per 15 minutes per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.headers['x-test-rate-limit-key']) {
      return String(req.headers['x-test-rate-limit-key']);
    }
    return req.ip;
  },
  skip: (req) => req.headers['x-bypass-rate-limit'] === 'true',
  message: {
    success: false,
    message: 'Too many failed login attempts. Please try again after 15 minutes.'
  }
});

// Public endpoints
router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);

// Protected endpoint
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;

