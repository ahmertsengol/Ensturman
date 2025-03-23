// config/passport.js - Passport configuration for authentication
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        
        // If user doesn't exist
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password is incorrect' });
        }
      } catch (err) {
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