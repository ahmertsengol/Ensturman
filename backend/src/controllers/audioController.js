const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const logger = require('../utils/logger');

// Upload a new audio recording
const uploadAudio = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      logger.warn('No audio file in request', { userId: req.user.id });
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const { title, description } = req.body;
    
    // Get the filename only
    const filename = path.basename(req.file.path);
    
    // Create relative URL path for web access (to be saved in database)
    const urlPath = `/uploads/${filename}`;
    
    const fileSize = req.file.size;
    
    logger.info('File uploaded successfully', {
      userId: req.user.id,
      filename: filename,
      originalFilename: req.file.originalname,
      urlPath: urlPath,
      size: fileSize,
      mimetype: req.file.mimetype
    });
    
    // You can extract duration from the audio file if needed
    // For now, setting it as null
    const duration = null;

    // Save to database
    const result = await db.query(
      'INSERT INTO audio_recordings (user_id, title, description, file_path, duration, file_size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, title || 'Untitled Recording', description || '', urlPath, duration, fileSize]
    );

    logger.info('Audio recording saved to database', {
      userId: req.user.id,
      recordingId: result.rows[0].id,
      title: title || 'Untitled Recording'
    });

    res.status(201).json({
      message: 'Audio recording uploaded successfully',
      recording: result.rows[0]
    });
  } catch (error) {
    logger.error('Upload error', { 
      error: error.message, 
      code: error.code,
      userId: req.user?.id
    });
    
    // File access error
    if (error.code === 'ENOENT') {
      return res.status(500).json({ 
        error: 'File system error',
        details: 'Could not access the upload directory'
      });
    }
    
    // Database error
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'A recording with this name already exists' });
    }
    
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};

// Get all audio recordings for a user
const getUserRecordings = async (req, res) => {
  try {
    logger.info('Fetching user recordings', { userId: req.user.id });
    
    const result = await db.query(
      'SELECT * FROM audio_recordings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    // Her kayıt için tam URL oluştur
    const host = `${req.protocol}://${req.get('host')}`;
    const recordings = result.rows.map(recording => ({
      ...recording,
      file_url: recording.file_path.startsWith('http') 
        ? recording.file_path 
        : `${host}${recording.file_path}`
    }));

    logger.debug('User recordings fetched successfully', { 
      userId: req.user.id, 
      count: recordings.length 
    });

    res.json(recordings);
  } catch (error) {
    logger.error('Get recordings error', { 
      error: error.message, 
      userId: req.user.id 
    });
    
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single audio recording
const getRecording = async (req, res) => {
  try {
    logger.info('Fetching single recording', { 
      userId: req.user.id, 
      recordingId: req.params.id 
    });
    
    const result = await db.query(
      'SELECT * FROM audio_recordings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      logger.warn('Recording not found', { 
        userId: req.user.id, 
        recordingId: req.params.id 
      });
      
      return res.status(404).json({ error: 'Recording not found' });
    }

    // Tam URL oluştur
    const recording = result.rows[0];
    const host = `${req.protocol}://${req.get('host')}`;
    recording.file_url = recording.file_path.startsWith('http') 
      ? recording.file_path 
      : `${host}${recording.file_path}`;

    logger.debug('Recording fetched successfully', {
      userId: req.user.id,
      recordingId: recording.id,
      title: recording.title
    });

    res.json(recording);
  } catch (error) {
    logger.error('Get recording error', { 
      error: error.message, 
      userId: req.user.id,
      recordingId: req.params.id
    });
    
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete an audio recording
const deleteRecording = async (req, res) => {
  try {
    logger.info('Deleting recording', { 
      userId: req.user.id, 
      recordingId: req.params.id 
    });
    
    // First get the recording to get the file path
    const getResult = await db.query(
      'SELECT * FROM audio_recordings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (getResult.rows.length === 0) {
      logger.warn('Recording not found for deletion', { 
        userId: req.user.id, 
        recordingId: req.params.id 
      });
      
      return res.status(404).json({ error: 'Recording not found' });
    }

    const recording = getResult.rows[0];
    
    // Delete from database
    await db.query(
      'DELETE FROM audio_recordings WHERE id = $1',
      [req.params.id]
    );

    logger.info('Recording deleted from database', { 
      userId: req.user.id, 
      recordingId: req.params.id,
      title: recording.title
    });

    // Eğer dosya yolu URL ise, bunu filesystem yoluna dönüştür
    let fileSystemPath = recording.file_path;
    if (fileSystemPath.startsWith('/uploads/')) {
      fileSystemPath = path.join(__dirname, '../../uploads', path.basename(fileSystemPath));
    }

    // Delete file from filesystem
    if (fs.existsSync(fileSystemPath)) {
      fs.unlinkSync(fileSystemPath);
      logger.info('Deleted file from filesystem', { 
        path: path.basename(fileSystemPath) 
      });
    } else {
      logger.warn('File not found for deletion', { 
        path: path.basename(fileSystemPath) 
      });
    }

    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    logger.error('Delete recording error', { 
      error: error.message, 
      userId: req.user.id,
      recordingId: req.params.id
    });
    
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  uploadAudio,
  getUserRecordings,
  getRecording,
  deleteRecording
}; 