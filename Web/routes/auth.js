// routes/auth.js - Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest, ensureAuthenticated } = require('../middlewares/auth');
const logger = require('../config/logger');

// Login page
router.get('/login', ensureGuest, authController.getLogin);

// Register page
router.get('/register', ensureGuest, authController.getRegister);

// Login process
router.post('/login', authController.login);

// Register process
router.post('/register', authController.register);

// Logout
router.get('/logout', ensureAuthenticated, authController.logout);

// Add POST method for logout to handle form submissions
router.post('/logout', ensureAuthenticated, authController.logout);

module.exports = router; 