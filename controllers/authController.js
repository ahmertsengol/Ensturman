// controllers/authController.js - Authentication controller
const passport = require('passport');
const User = require('../models/User');

// @desc    Render login page
// @route   GET /auth/login
exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Login',
    user: req.user
  });
};

// @desc    Process login form
// @route   POST /auth/login
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      // Store error message in session
      req.session.error_msg = info.message || 'Authentication failed';
      
      // Store in sessionStorage for client-side access
      res.cookie('error_msg', info.message || 'Authentication failed', { maxAge: 5000 });
      
      return res.redirect('/auth/login');
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      
      return res.redirect('/dashboard');
    });
  })(req, res, next);
};

// @desc    Render register page
// @route   GET /auth/register
exports.getRegister = (req, res) => {
  res.render('register', {
    title: 'Register',
    user: req.user
  });
};

// @desc    Process register form
// @route   POST /auth/register
exports.postRegister = async (req, res) => {
  try {
    const { username, email, password, password2 } = req.body;
    
    // Validation
    const errors = [];
    
    if (!username || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
    }
    
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
    
    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }
    
    if (errors.length > 0) {
      // Store error messages for the form
      const errorMessages = errors.map(error => error.msg).join(', ');
      req.session.error_msg = errorMessages;
      
      // Store in sessionStorage for client-side access
      res.cookie('error_msg', errorMessages, { maxAge: 5000 });
      
      return res.redirect('/auth/register');
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      req.session.error_msg = 'Email is already registered';
      res.cookie('error_msg', 'Email is already registered', { maxAge: 5000 });
      return res.redirect('/auth/register');
    }
    
    // Create new user
    await User.create({
      username,
      email,
      password
    });
    
    req.session.success_msg = 'You are now registered and can log in';
    res.cookie('success_msg', 'You are now registered and can log in', { maxAge: 5000 });
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.status(500).render('error/500');
  }
};

// @desc    Logout user
// @route   GET /auth/logout
exports.logout = (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error(err);
      return res.redirect('/dashboard');
    }
    req.session.success_msg = 'You have been logged out';
    res.cookie('success_msg', 'You have been logged out', { maxAge: 5000 });
    res.redirect('/');
  });
}; 