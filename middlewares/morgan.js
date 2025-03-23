// middlewares/morgan.js - HTTP request logging middleware
const morgan = require('morgan');
const logger = require('../config/logger');

// Define custom token for request body
morgan.token('body', (req) => {
  const body = { ...req.body };
  
  // Remove sensitive information
  if (body.password) body.password = '[REDACTED]';
  if (body.email) body.email = '[REDACTED]';
  
  return JSON.stringify(body);
});

// Define custom token for response body
morgan.token('res-body', (req, res) => {
  if (res.statusCode >= 400) {
    return JSON.stringify(res.body || {});
  }
  return '';
});

// Define custom token for user info
morgan.token('user', (req) => {
  if (req.user) {
    return `user: ${req.user.id}`;
  }
  return 'guest';
});

// Define custom morgan format
const morganFormat = ':method :url :status :response-time ms - :res[content-length] - :user - :body :res-body';

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
  write: (message) => logger.http(message.trim()),
};

// Export the middleware
const morganMiddleware = morgan(morganFormat, { stream });

module.exports = morganMiddleware; 