// controllers/recordingController.js - Controller for recordings
const path = require('path');
const fs = require('fs');
const Recording = require('../models/Recording');
const User = require('../models/User');
const { Op } = require('sequelize');
const logger = require('../config/logger');

// @desc    Get dashboard with recordings
// @route   GET /dashboard
exports.getDashboard = async (req, res) => {
  try {
    const recordings = await Recording.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    
    logger.debug(`Retrieved ${recordings.length} recordings for user ${req.user.id}`);
    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      recordings
    });
  } catch (err) {
    logger.error('Error retrieving dashboard:', err);
    res.status(500).render('error/500');
  }
};

// @desc    Show add recording page
// @route   GET /recordings/add
exports.getAddRecording = (req, res) => {
  logger.debug(`User ${req.user.id} accessed the add recording page`);
  res.render('recordings/add', {
    title: 'Record Audio',
    user: req.user
  });
};

// @desc    Process add recording
// @route   POST /recordings
exports.addRecording = async (req, res) => {
  try {
    logger.info(`Processing recording upload for user ${req.user.id}`);
    logger.debug('Request body:', req.body);
    logger.debug('Request file:', req.file);
    
    // Add user to recording
    req.body.userId = req.user.id;
    
    // Check for audio file
    if (!req.file) {
      logger.warn(`No file uploaded by user ${req.user.id}`);
      req.session.error_msg = 'Please upload an audio file';
      res.cookie('error_msg', 'Please upload an audio file', { maxAge: 5000 });
      return res.redirect('/recordings/add');
    }
    
    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      logger.warn(`Invalid file type uploaded by user ${req.user.id}: ${req.file.mimetype}`);
      
      // Remove the invalid file
      fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
      logger.debug(`Deleted invalid file: ${req.file.filename}`);
      
      req.session.error_msg = 'Please upload a valid audio file';
      res.cookie('error_msg', 'Please upload a valid audio file', { maxAge: 5000 });
      return res.redirect('/recordings/add');
    }
    
    // Create recording
    const recording = await Recording.create({
      title: req.body.title,
      description: req.body.description || '',
      audioFile: req.file.filename,
      userId: req.user.id,
      duration: req.body.duration || 0
    });
    
    logger.info(`Recording created successfully: id=${recording.id}, title="${recording.title}"`);
    req.session.success_msg = 'Recording added successfully';
    res.cookie('success_msg', 'Recording added successfully', { maxAge: 5000 });
    res.redirect('/dashboard');
  } catch (err) {
    logger.error('Error adding recording:', err);
    
    // Clean up file if it was uploaded but database insertion failed
    if (req.file) {
      try {
        fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
        logger.debug(`Cleaned up file after error: ${req.file.filename}`);
      } catch (unlinkErr) {
        logger.error('Error cleaning up file:', unlinkErr);
      }
    }
    
    req.session.error_msg = 'Error adding recording';
    res.cookie('error_msg', 'Error adding recording', { maxAge: 5000 });
    res.redirect('/recordings/add');
  }
};

// @desc    Show edit recording page
// @route   GET /recordings/edit/:id
exports.getEditRecording = async (req, res) => {
  try {
    const recording = await Recording.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!recording) {
      logger.warn(`User ${req.user.id} attempted to edit non-existent recording id=${req.params.id}`);
      return res.status(404).render('error/404');
    }
    
    logger.debug(`User ${req.user.id} is editing recording id=${recording.id}`);
    res.render('recordings/edit', {
      title: 'Edit Recording',
      recording,
      user: req.user
    });
  } catch (err) {
    logger.error(`Error retrieving recording for editing: id=${req.params.id}`, err);
    res.status(500).render('error/500');
  }
};

// @desc    Update recording
// @route   PUT /recordings/:id
exports.updateRecording = async (req, res) => {
  try {
    let recording = await Recording.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!recording) {
      logger.warn(`User ${req.user.id} attempted to update non-existent recording id=${req.params.id}`);
      return res.status(404).render('error/404');
    }
    
    // Update recording
    await recording.update({
      title: req.body.title,
      description: req.body.description
    });
    
    logger.info(`Recording updated successfully: id=${recording.id}, title="${recording.title}"`);
    req.session.success_msg = 'Recording updated successfully';
    res.cookie('success_msg', 'Recording updated successfully', { maxAge: 5000 });
    res.redirect('/dashboard');
  } catch (err) {
    logger.error(`Error updating recording: id=${req.params.id}`, err);
    res.status(500).render('error/500');
  }
};

// @desc    Delete recording
// @route   DELETE /recordings/:id
exports.deleteRecording = async (req, res) => {
  try {
    const recording = await Recording.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!recording) {
      logger.warn(`User ${req.user.id} attempted to delete non-existent recording id=${req.params.id}`);
      return res.status(404).render('error/404');
    }
    
    logger.info(`Deleting recording: id=${recording.id}, title="${recording.title}"`);
    
    // Delete file from server
    const filePath = path.join(__dirname, '../uploads', recording.audioFile);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`Deleted file: ${recording.audioFile}`);
    } else {
      logger.warn(`File not found for deletion: ${recording.audioFile}`);
    }
    
    // Delete recording from database
    await recording.destroy();
    logger.info(`Recording deleted from database: id=${recording.id}`);
    
    req.session.success_msg = 'Recording deleted successfully';
    res.cookie('success_msg', 'Recording deleted successfully', { maxAge: 5000 });
    res.redirect('/dashboard');
  } catch (err) {
    logger.error(`Error deleting recording: id=${req.params.id}`, err);
    res.status(500).render('error/500');
  }
}; 