// middlewares/flash.js - Flash message middleware
module.exports = function(req, res, next) {
  // Set success and error flash messages
  res.locals.success_msg = req.session.success_msg || '';
  res.locals.error_msg = req.session.error_msg || '';
  res.locals.error = req.session.error || '';

  // Clear flash messages after they've been used
  delete req.session.success_msg;
  delete req.session.error_msg;
  delete req.session.error;
  
  next();
}; 