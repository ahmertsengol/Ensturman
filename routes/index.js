// routes/index.js - Main routes
const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middlewares/auth');
const recordingController = require('../controllers/recordingController');

// Home page
router.get('/', ensureGuest, (req, res) => {
  res.render('index', {
    title: 'Voice Recorder',
    user: req.user
  });
});

// Dashboard
router.get('/dashboard', ensureAuth, recordingController.getDashboard);

module.exports = router; 