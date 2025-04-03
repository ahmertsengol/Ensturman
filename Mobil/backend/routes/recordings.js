const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Defines storage destination and file naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const userDir = path.join(__dirname, '../../updates/recordings', req.user.id.toString());
    
    if (!fs.existsSync(path.join(__dirname, '../../updates'))) {
      fs.mkdirSync(path.join(__dirname, '../../updates'));
    }
    
    if (!fs.existsSync(path.join(__dirname, '../../updates/recordings'))) {
      fs.mkdirSync(path.join(__dirname, '../../updates/recordings'));
    }
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // Use timestamp + original extension to avoid filename conflicts
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExt = path.extname(file.originalname) || '.m4a';
    cb(null, `recording-${timestamp}${fileExt}`);
  }
});

// Initialize multer with storage configuration
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // Limit to 50MB
});

// @route   GET /api/recordings
// @desc    Get all recordings for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM recordings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/recordings
// @desc    Upload a new recording
// @access  Private
router.post('/', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No audio file uploaded' });
    }
    
    const { title, duration } = req.body;
    const filePath = req.file.path;
    
    // Save recording metadata to database
    const result = await db.query(
      'INSERT INTO recordings (user_id, title, file_path, duration) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, filePath, duration]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/recordings/:id
// @desc    Get a specific recording
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM recordings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Recording not found or unauthorized' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/recordings/file/:id
// @desc    Stream a recording file
// @access  Private
router.get('/file/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM recordings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Recording not found or unauthorized' });
    }
    
    const recording = result.rows[0];
    
    if (!fs.existsSync(recording.file_path)) {
      return res.status(404).json({ msg: 'Recording file not found' });
    }
    
    // Stream the file
    const stat = fs.statSync(recording.file_path);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(recording.file_path, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      });
      
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });
      
      fs.createReadStream(recording.file_path).pipe(res);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/recordings/:id
// @desc    Delete a recording
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Get the recording to check if it exists and belongs to the user
    const getResult = await db.query(
      'SELECT * FROM recordings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Recording not found or unauthorized' });
    }
    
    const recording = getResult.rows[0];
    
    // Delete file from disk
    if (fs.existsSync(recording.file_path)) {
      fs.unlinkSync(recording.file_path);
    }
    
    // Delete from database
    await db.query(
      'DELETE FROM recordings WHERE id = $1',
      [req.params.id]
    );
    
    res.json({ msg: 'Recording deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 