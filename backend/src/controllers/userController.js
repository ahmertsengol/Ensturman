const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const logger = require('../utils/logger');

// Register a new user
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    logger.info(`User registration attempt`, { email, username });

    // Check if user already exists
    const userCheck = await db.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userCheck.rows.length > 0) {
      const existingUser = userCheck.rows[0];
      logger.warn(`Registration failed - user already exists`, { 
        email, 
        username,
        existingEmail: existingUser.email === email,
        existingUsername: existingUser.username === username
      });
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'laz_audio_recording_app_secret_key',
      { expiresIn: '7d' }
    );

    logger.info(`User registered successfully`, { 
      userId: user.id, 
      username: user.username, 
      email: user.email 
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    logger.error(`Registration error`, { 
      error: error.message, 
      stack: error.stack,
      email,
      username
    });
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    logger.info(`Login attempt`, { email });

    // Check if user exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      logger.warn(`Login failed - user not found`, { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      logger.warn(`Login failed - invalid password`, { 
        userId: user.id, 
        email: user.email 
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'laz_audio_recording_app_secret_key',
      { expiresIn: '7d' }
    );

    // Log user activity
    logger.userActivity('login', {
      id: user.id,
      username: user.username,
      email: user.email
    }, {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    logger.error(`Login error`, { 
      error: error.message, 
      stack: error.stack,
      email 
    });
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    logger.info(`Profile access`, { userId: req.user.id });

    const result = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      logger.warn(`Profile access failed - user not found`, { userId: req.user.id });
      return res.status(404).json({ error: 'User not found' });
    }

    logger.debug(`Profile retrieved successfully`, { userId: req.user.id });

    res.json(result.rows[0]);
  } catch (error) {
    logger.error(`Profile access error`, { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.id 
    });
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // In a stateless JWT authentication system, we can't invalidate tokens server-side
    // We can only log the logout event and rely on the client to remove the token
    
    if (req.user) {
      logger.userActivity('logout', {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      }, {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      });
      
      logger.info(`User logged out`, { userId: req.user.id, username: req.user.username });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout error`, { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.id 
    });
    res.status(500).json({ error: 'Server error' });
  }
};

// Change user password with 2FA verification
const changePassword = async (req, res) => {
  const { currentPassword, newPassword, verificationCode } = req.body;

  try {
    logger.info(`Password change attempt with 2FA`, { userId: req.user.id });

    // Validate input
    if (!currentPassword || !newPassword || !verificationCode) {
      logger.warn(`Password change failed - missing fields`, { userId: req.user.id });
      return res.status(400).json({ 
        error: 'Current password, new password, and verification code are required' 
      });
    }

    if (newPassword.length < 8) {
      logger.warn(`Password change failed - password too short`, { userId: req.user.id });
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    if (verificationCode.length !== 6) {
      logger.warn(`Password change failed - invalid verification code format`, { userId: req.user.id });
      return res.status(400).json({ error: 'Invalid verification code format' });
    }

    // Check if user has a valid, unused verification code
    const verificationResult = await db.query(
      `SELECT id, expires_at FROM verification_codes 
       WHERE user_id = $1 AND verification_code = $2 
       AND verification_type = 'password_change' AND is_used = TRUE
       AND used_at > NOW() - INTERVAL '5 minutes'
       ORDER BY used_at DESC LIMIT 1`,
      [req.user.id, verificationCode]
    );

    if (verificationResult.rows.length === 0) {
      logger.warn(`Password change failed - no valid 2FA verification found`, { 
        userId: req.user.id 
      });
      return res.status(401).json({ 
        error: 'Invalid or expired 2FA verification. Please verify your email first.' 
      });
    }

    // Get current user data
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    if (userResult.rows.length === 0) {
      logger.warn(`Password change failed - user not found`, { userId: req.user.id });
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      logger.warn(`Password change failed - invalid current password`, { 
        userId: req.user.id,
        email: user.email 
      });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      logger.warn(`Password change failed - same password`, { userId: req.user.id });
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await db.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, req.user.id]
    );

    // Invalidate all verification codes for this user (cleanup)
    await db.query(
      `UPDATE verification_codes 
       SET is_used = TRUE, used_at = NOW() 
       WHERE user_id = $1 AND verification_type = 'password_change' AND is_used = FALSE`,
      [req.user.id]
    );

    // Log password change activity
    logger.userActivity('password_change_completed', {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }, {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
      verificationUsed: true
    });

    logger.info(`Password changed successfully with 2FA`, { 
      userId: req.user.id, 
      username: req.user.username 
    });

    res.json({ 
      message: 'Password updated successfully with 2FA verification',
      success: true 
    });
  } catch (error) {
    logger.error(`Password change error`, { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.id 
    });
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  changePassword
}; 