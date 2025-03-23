// routes/auth.js - Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest } = require('../middlewares/auth');

// Login page
router.get('/login', ensureGuest, authController.getLogin);

// Register page
router.get('/register', ensureGuest, authController.getRegister);

// Login process
router.post('/login', authController.postLogin);

// Register process
router.post('/register', authController.postRegister);

// Logout
router.get('/logout', authController.logout);

module.exports = router; 