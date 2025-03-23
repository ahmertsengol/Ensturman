// middlewares/auth.js - Authentication middleware
module.exports = {
  // Ensure user is authenticated
  ensureAuth: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/auth/login');
  },
  
  // Ensure guest (not authenticated)
  ensureGuest: function(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/dashboard');
    }
    next();
  }
}; 