// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

// Register new user
router.post('/register', userController.register);

// Login user
router.post('/login', userController.login);

// Logout user (protected route)
router.post('/logout', auth, userController.logout);

// Get user profile (protected route)
router.get('/profile', auth, userController.getProfile);

// Change password (protected route)
router.put('/change-password', auth, userController.changePassword);

module.exports = router; 