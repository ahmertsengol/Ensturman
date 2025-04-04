// routes/recordings.js - Routes for recordings
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const recordingController = require('../controllers/recordingController');
const { ensureAuthenticated } = require('../middlewares/auth');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const checkFileType = (file, cb) => {
  // Allowed extensions
  const filetypes = /audio\/*/;
  
  // Check mimetype
  const mimetype = filetypes.test(file.mimetype);
  
  if (mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Audio files only!');
  }
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 100000000 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

// Add recording page
router.get('/add', ensureAuthenticated, recordingController.getAddRecording);

// Add recording - POST
router.post('/', ensureAuthenticated, upload.single('audio'), recordingController.addRecording);

// Edit recording page
router.get('/edit/:id', ensureAuthenticated, recordingController.getEditRecording);

// Update recording
router.put('/:id', ensureAuthenticated, recordingController.updateRecording);

// Delete recording
router.delete('/:id', ensureAuthenticated, recordingController.deleteRecording);

module.exports = router; 