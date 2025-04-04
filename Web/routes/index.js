// routes/index.js - Main routes
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');
const recordingController = require('../controllers/recordingController');
const logger = require('../config/logger');

// Home page
router.get('/', (req, res) => {
  logger.debug(`Home page accessed by ${req.user ? `user ${req.user.id}` : 'guest'}`);
  res.render('index', {
    title: 'Voice Recorder',
    user: req.user
  });
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, recordingController.getDashboard);

// Pitch Detection - New page for real-time note detection
router.get('/pitch-detection', ensureAuthenticated, (req, res) => {
  logger.debug(`Pitch detection page accessed by user ${req.user.id}`);
  res.render('pitch-detection', {
    title: 'Real-time Note Detection',
    user: req.user
  });
});

module.exports = router; 