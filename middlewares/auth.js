// middlewares/auth.js - Authentication middleware
const logger = require('../config/logger');

/**
 * Authentication middleware to ensure user is logged in before accessing protected routes
 */
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    logger.debug(`Authenticated request from user ${req.user.id} for ${req.originalUrl}`);
    return next();
  }
  
  logger.warn(`Unauthenticated access attempt to protected route: ${req.originalUrl}`);
  req.session.error_msg = 'Please log in to access this resource';
  res.cookie('error_msg', 'Please log in to access this resource', { maxAge: 5000 });
  res.redirect('/login');
};

/**
 * Guest middleware to redirect authenticated users away from login/register pages
 */
exports.ensureGuest = (req, res, next) => {
  if (!req.isAuthenticated()) {
    logger.debug(`Guest access to ${req.originalUrl}`);
    return next();
  }
  
  logger.debug(`Redirecting authenticated user ${req.user.id} from ${req.originalUrl} to /dashboard`);
  res.redirect('/dashboard');
}; 