// middlewares/flash.js - Flash message middleware
const logger = require('../config/logger');

/**
 * Flash middleware to handle flash messages from session and cookies
 */
module.exports = (req, res, next) => {
  // Check for success_msg in session
  if (req.session.success_msg) {
    res.locals.success_msg = req.session.success_msg;
    logger.debug(`Setting success flash message: ${req.session.success_msg}`);
    delete req.session.success_msg;
  }

  // Check for error_msg in session
  if (req.session.error_msg) {
    res.locals.error_msg = req.session.error_msg;
    logger.debug(`Setting error flash message: ${req.session.error_msg}`);
    delete req.session.error_msg;
  }

  // Check for error in session
  if (req.session.error) {
    res.locals.error = req.session.error;
    logger.debug(`Setting passport error message: ${req.session.error}`);
    delete req.session.error;
  }

  // Pass to next middleware
  next();
}; 