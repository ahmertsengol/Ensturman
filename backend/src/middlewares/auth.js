const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Authentication middleware for JWT verification
 * Works both as default export and named export (authenticateToken)
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('Authentication failed: No token provided', {
        path: req.originalUrl,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress
      });
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laz_audio_recording_app_secret_key');
    
    // Add user from payload
    req.user = decoded;
    
    logger.debug('Authentication successful', {
      userId: decoded.id,
      username: decoded.username,
      path: req.originalUrl,
      method: req.method
    });
    
    next();
  } catch (error) {
    logger.error('Authentication failed: Invalid token', {
      error: error.message,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress
    });
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Export as both default and named export for compatibility with different import styles
module.exports = auth; 
module.exports.authenticateToken = auth; 