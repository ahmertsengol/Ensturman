// routes/api.js - API routes for fetching data
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');
const Recording = require('../models/Recording');
const User = require('../models/User');
const logger = require('../config/logger');

// @desc    Get current user
// @route   GET /api/user
router.get('/user', ensureAuthenticated, (req, res) => {
  logger.debug(`API: User ${req.user.id} requested their profile data`);
  res.json({
    id: req.user.id,
    name: req.user.username,
    email: req.user.email
  });
});

// @desc    Get all recordings for current user
// @route   GET /api/recordings
router.get('/recordings', ensureAuthenticated, async (req, res) => {
  try {
    logger.debug(`API: User ${req.user.id} requested their recordings`);
    const recordings = await Recording.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    
    logger.debug(`API: Fetched ${recordings.length} recordings for user ${req.user.id}`);
    res.json(recordings);
  } catch (err) {
    logger.error('API Error fetching recordings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get single recording
// @route   GET /api/recordings/:id
router.get('/recordings/:id', ensureAuthenticated, async (req, res) => {
  try {
    logger.debug(`API: User ${req.user.id} requested recording id=${req.params.id}`);
    const recording = await Recording.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    
    if (!recording) {
      logger.warn(`API: User ${req.user.id} requested non-existent recording id=${req.params.id}`);
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    logger.debug(`API: Fetched recording id=${recording.id} for user ${req.user.id}`);
    res.json(recording);
  } catch (err) {
    logger.error(`API Error fetching recording id=${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 