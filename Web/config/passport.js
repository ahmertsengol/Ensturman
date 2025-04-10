// config/passport.js - Passport configuration for authentication
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const logger = require('./logger');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ 
      usernameField: 'email',
      passwordField: 'password' 
    }, async (email, password, done) => {
      try {
        // Log form data with safety precautions
        logger.debug(`Attempting authentication for email: ${email}`);
        logger.debug(`Received password field - length: ${password ? password.length : 0}`);
        
        // Find user by email
        const user = await User.findOne({ where: { email } });
        
        // If user doesn't exist
        if (!user) {
          logger.warn(`Authentication failed: Email not found: ${email}`);
          return done(null, false, { message: 'That email is not registered' });
        }

        logger.debug(`User found with email: ${email}, checking password`);
        
        // Check password - normal comparison
        const isMatch = await user.matchPassword(password);
        logger.debug(`Password match result: ${isMatch}`);
        
        if (isMatch) {
          logger.debug(`Authentication successful for email: ${email}`);
          return done(null, user);
        } else {
          logger.warn(`Authentication failed: Incorrect password for email: ${email}`);
          return done(null, false, { message: 'Password is incorrect' });
        }
      } catch (err) {
        logger.error(`Authentication error: ${err.message}`);
        return done(err);
      }
    })
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}; 