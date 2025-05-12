// src/routes/audioRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const audioController = require('../controllers/audioController');
const auth = require('../middlewares/auth');
const fs = require('fs');
const logger = require('../utils/logger');

// Uploads klasörünün tam yolu
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Uploads dizinini oluştur (yoksa)
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  logger.info(`Created uploads directory at: ${UPLOAD_DIR}`);
}

// Function to get MIME type based on file extension
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.oga': 'audio/ogg',
    '.opus': 'audio/opus',
    '.m4a': 'audio/aac',
    '.aac': 'audio/aac',
    '.flac': 'audio/flac',
    '.webm': 'audio/webm',
  };
  
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  logger.debug(`MIME type for extension ${ext}`, { ext, mimeType });
  
  return mimeType;
};

// Set up multer storage for audio files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `audio-${uniqueSuffix}${ext}`;
    
    logger.debug('Creating file name for upload', { 
      originalName: file.originalname,
      newFilename: filename,
      extension: ext,
      mimeType: file.mimetype 
    });
    
    cb(null, filename);
  }
});

// File filter for audio files
const fileFilter = (req, file, cb) => {
  // Accept audio files only
  if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
    logger.debug('Accepting file upload', { 
      mimetype: file.mimetype, 
      originalname: file.originalname 
    });
    cb(null, true);
  } else {
    logger.warn('Rejected file upload - not an audio file', { 
      mimetype: file.mimetype, 
      originalname: file.originalname 
    });
    cb(new Error('Only audio files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload audio recording (protected route)
router.post('/upload', auth, upload.single('audio'), audioController.uploadAudio);

// Get all recordings for logged in user (protected route)
router.get('/', auth, audioController.getUserRecordings);

// Stream audio file by filename (no auth required for simplicity)
router.get('/stream/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);
  
  logger.info(`Streaming file request received`, { filename });
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    logger.warn(`Audio file not found for streaming`, { filename, path: filePath });
    return res.status(404).json({ error: 'Audio file not found' });
  }
  
  // Get file stats
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  // Determine the correct MIME type
  const contentType = getMimeType(filename);
  logger.debug(`Content type for ${filename}: ${contentType}`, { 
    filename, 
    contentType, 
    fileSize,
    hasRangeHeader: !!range
  });
  
  // Ekstra headers ekle - M4A dosyaları için tarayıcı uyumluluğunu geliştir
  const customHeaders = {
    'Content-Type': contentType,
    'Content-Disposition': `inline; filename="${filename}"`,
    'Cache-Control': 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  };

  // M4A veya AAC formatıyla ilgili sorun yaşanırsa tarayıcıya daha fazla bilgi sağla
  if (contentType === 'audio/aac' || path.extname(filename).toLowerCase() === '.m4a') {
    customHeaders['Content-Type'] = contentType + '; codecs="mp4a.40.2"';
    logger.debug('Added codec information for M4A/AAC file', { 
      contentType: customHeaders['Content-Type']
    });
  }
  
  // Handle range request (for streaming)
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    
    const headers = {
      ...customHeaders,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
    };
    
    logger.debug('Streaming with range request', { 
      range, 
      start, 
      end, 
      chunksize
    });
    
    res.writeHead(206, headers);
    file.pipe(res);
    
    // Log piping errors
    file.on('error', (err) => {
      logger.error('Error streaming file', {
        filename,
        error: err.message
      });
    });
  } else {
    // If no range requested, send entire file
    const headers = {
      ...customHeaders,
      'Content-Length': fileSize,
    };
    
    logger.debug('Streaming entire file', { fileSize });
    
    res.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    
    // Log piping errors
    stream.on('error', (err) => {
      logger.error('Error streaming entire file', {
        filename,
        error: err.message
      });
    });
  }
});

// Get specific recording (protected route)
router.get('/:id', auth, audioController.getRecording);

// Delete recording (protected route)
router.delete('/:id', auth, audioController.deleteRecording);

module.exports = router; 