// routes/api.js - API routes for fetching data
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/auth');
const Recording = require('../models/Recording');
const User = require('../models/User');

// @desc    Get current user
// @route   GET /api/user
router.get('/user', ensureAuth, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email
  });
});

// @desc    Get all recordings for current user
// @route   GET /api/recordings
router.get('/recordings', ensureAuth, async (req, res) => {
  try {
    const recordings = await Recording.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    
    res.json(recordings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get single recording
// @route   GET /api/recordings/:id
router.get('/recordings/:id', ensureAuth, async (req, res) => {
  try {
    const recording = await Recording.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    res.json(recording);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 