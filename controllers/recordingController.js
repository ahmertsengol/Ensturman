// controllers/recordingController.js - Controller for recordings
const path = require('path');
const fs = require('fs');
const Recording = require('../models/Recording');
const User = require('../models/User');
const { Op } = require('sequelize');

// @desc    Get dashboard with recordings
// @route   GET /dashboard
exports.getDashboard = async (req, res) => {
  try {
    const recordings = await Recording.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    
    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      recordings
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error/500');
  }
};

// @desc    Show add recording page
// @route   GET /recordings/add
exports.getAddRecording = (req, res) => {
  res.render('recordings/add', {
    title: 'Record Audio',
    user: req.user
  });
};

// @desc    Process add recording
// @route   POST /recordings
exports.addRecording = async (req, res) => {
  try {
    console.log('Processing recording upload');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Add user to recording
    req.body.userId = req.user.id;
    
    // Check for audio file
    if (!req.file) {
      console.error('No file uploaded');
      req.session.error_msg = 'Please upload an audio file';
      res.cookie('error_msg', 'Please upload an audio file', { maxAge: 5000 });
      return res.redirect('/recordings/add');
    }
    
    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.error('Invalid file type:', req.file.mimetype);
      
      // Remove the invalid file
      fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
      
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
    
    console.log('Recording created:', recording.id);
    req.session.success_msg = 'Recording added successfully';
    res.cookie('success_msg', 'Recording added successfully', { maxAge: 5000 });
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error adding recording:', err);
    
    // Clean up file if it was uploaded but database insertion failed
    if (req.file) {
      try {
        fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
        console.log('Cleaned up file after error:', req.file.filename);
      } catch (unlinkErr) {
        console.error('Error cleaning up file:', unlinkErr);
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
      return res.status(404).render('error/404');
    }
    
    res.render('recordings/edit', {
      title: 'Edit Recording',
      recording,
      user: req.user
    });
  } catch (err) {
    console.error(err);
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
      return res.status(404).render('error/404');
    }
    
    // Update recording
    await recording.update({
      title: req.body.title,
      description: req.body.description
    });
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
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
      return res.status(404).render('error/404');
    }
    
    // Delete file from server
    const filePath = path.join(__dirname, '../uploads', recording.audioFile);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete recording from database
    await recording.destroy();
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error/500');
  }
}; 