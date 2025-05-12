// src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const audioRoutes = require('./routes/audioRoutes');
const trainingRoutes = require('./routes/trainingRoutes');

// Import logger
const logger = require('./utils/logger');

// Uploads klasörünün tam yolu
const UPLOAD_DIR = path.join(__dirname, '../uploads');

// Uploads dizinini oluştur (yoksa)
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  logger.info(`Created uploads directory at: ${UPLOAD_DIR}`);
}

// Initialize the app
const app = express();

// CORS yapılandırması - daha basit ve güvenilir yöntemle
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: false
}));

// JSON ve URLEncoded body parser middleware'leri
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the request logger middleware for all routes
app.use(logger.requestLogger);

// Make uploads directory accessible
app.use('/uploads', express.static(UPLOAD_DIR));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Debug endpoint to test CORS
app.get('/test-cors', (req, res) => {
  res.status(200).json({ message: 'CORS is working!' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/training', trainingRoutes);

// Generic error handler
app.use((err, req, res, next) => {
  logger.error('Server error', {
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress
  });
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum file size is 10MB.'
      });
    }
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server started on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
  logger.info(`Access via http://localhost:${PORT} or http://<your-ip-address>:${PORT}`);
}); 