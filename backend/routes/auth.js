const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('username', 'Username is required').not().isEmpty().isLength({ min: 3, max: 30 }),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public (requires refresh token in cookies)
router.post('/refresh-token', authController.refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user / clear refresh token
// @access  Private
router.post('/logout', auth, authController.logout);

// @route   GET /api/auth/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, authController.getProfile);

// @route   PUT /api/auth/me
// @desc    Update current user's profile
// @access  Private
router.put(
  '/me',
  auth,
  [
    body('fullName', 'Full name is required').optional().not().isEmpty(),
    body('phoneNumber', 'Please include a valid phone number')
      .optional()
      .matches(/^[0-9\-\+]{9,15}$/)
  ],
  authController.updateProfile
);

module.exports = router;
