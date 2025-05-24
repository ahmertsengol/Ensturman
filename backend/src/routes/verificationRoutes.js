const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const auth = require('../middlewares/auth');

// Request password change verification code (protected route)
router.post('/password-change/request', auth, verificationController.requestPasswordChangeVerification);

// Verify password change code (protected route)
router.post('/password-change/verify', auth, verificationController.verifyPasswordChangeCode);

// Get verification status (protected route)
router.get('/password-change/status', auth, verificationController.getVerificationStatus);

module.exports = router; 