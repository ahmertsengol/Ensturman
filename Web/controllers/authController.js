// controllers/authController.js - Authentication controller
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

// @desc    Render login page
// @route   GET /auth/login
exports.getLogin = (req, res) => {
  if (req.isAuthenticated()) {
    logger.debug(`Already authenticated user ${req.user.id} redirected to dashboard`);
    return res.redirect('/dashboard');
  }
  res.render('login', {
    title: 'Login',
    user: req.user
  });
};

// @desc    Process login
// @route   POST /login
exports.login = (req, res, next) => {
  logger.debug('Login attempt for email:', req.body.email);
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      logger.error('Login error:', err);
      req.session.error_msg = 'An error occurred during login';
      res.cookie('error_msg', 'An error occurred during login', { maxAge: 5000 });
      return res.redirect('/login');
    }
    
    if (!user) {
      logger.warn(`Failed login attempt for email: ${req.body.email}, reason: ${info.message}`);
      req.session.error_msg = info.message || 'Invalid username or password';
      res.cookie('error_msg', info.message || 'Invalid username or password', { maxAge: 5000 });
      return res.redirect('/login');
    }
    
    req.logIn(user, (err) => {
      if (err) {
        logger.error('Error during session login:', err);
        req.session.error_msg = 'An error occurred during login';
        res.cookie('error_msg', 'An error occurred during login', { maxAge: 5000 });
        return res.redirect('/login');
      }
      
      logger.info(`User ${user.id} (${user.username}) logged in successfully`);
      req.session.success_msg = 'You are now logged in';
      res.cookie('success_msg', 'You are now logged in', { maxAge: 5000 });
      return res.redirect('/dashboard');
    });
  })(req, res, next);
};

// @desc    Render register page
// @route   GET /auth/register
exports.getRegister = (req, res) => {
  if (req.isAuthenticated()) {
    logger.debug(`Already authenticated user ${req.user.id} redirected to dashboard`);
    return res.redirect('/dashboard');
  }
  res.render('register', {
    title: 'Register',
    user: req.user
  });
};

// @desc    Process register
// @route   POST /register
exports.register = async (req, res) => {
  const { username, email, password, password2 } = req.body;
  
  try {
    // Validation
    const errors = [];
    
    if (!username || !email || !password || !password2) {
      errors.push('Please fill in all fields');
    }
    
    if (password !== password2) {
      errors.push('Passwords do not match');
    }
    
    if (password.length < 6) {
      errors.push('Password should be at least 6 characters');
    }
    
    // Check for existing user
    const userExists = await User.findOne({
      where: { email }
    });
    
    if (userExists) {
      errors.push('Email is already registered');
    }
    
    // Check for existing username
    const usernameExists = await User.findOne({
      where: { username }
    });
    
    if (usernameExists) {
      errors.push('Username is already taken');
    }
    
    if (errors.length > 0) {
      logger.warn(`Registration validation errors for ${email}:`, errors);
      req.session.error_msg = errors.join(', ');
      res.cookie('error_msg', errors.join(', '), { maxAge: 5000 });
      return res.redirect('/register');
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password: password // Artık hash kontrolüne gerek yok çünkü düz metin olarak saklıyoruz
    });
    
    logger.info(`New user registered: id=${user.id}, username=${username}`);
    req.session.success_msg = 'You are now registered and can log in';
    res.cookie('success_msg', 'You are now registered and can log in', { maxAge: 5000 });
    res.redirect('/login');
  } catch (err) {
    logger.error('Error during registration:', err);
    req.session.error_msg = 'An error occurred during registration';
    res.cookie('error_msg', 'An error occurred during registration', { maxAge: 5000 });
    res.redirect('/register');
  }
};

// @desc    Logout user
// @route   GET /auth/logout
exports.logout = (req, res) => {
  const userId = req.user ? req.user.id : 'unknown';
  const username = req.user ? req.user.username : 'unknown';
  
  req.logout(err => {
    if (err) {
      logger.error(`Error during logout for user ${userId}:`, err);
      req.session.error_msg = 'Error during logout';
      res.cookie('error_msg', 'Error during logout', { maxAge: 5000 });
      return res.redirect('/');
    }
    
    logger.info(`User ${userId} (${username}) logged out successfully`);
    req.session.success_msg = 'You are logged out';
    res.cookie('success_msg', 'You are logged out', { maxAge: 5000 });
    res.redirect('/');
  });
}; 