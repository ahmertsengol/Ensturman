const db = require('../config/db');
const logger = require('../utils/logger');
const { generateVerificationCode, sendPasswordChangeVerificationEmail } = require('../services/emailService');

// Request password change verification code
const requestPasswordChangeVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const username = req.user.username;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    logger.info(`Password change verification requested`, { 
      userId, 
      email: userEmail,
      ip: ipAddress 
    });

    // Check if there's already an active verification code
    const existingCodeResult = await db.query(
      `SELECT id, expires_at FROM verification_codes 
       WHERE user_id = $1 AND verification_type = 'password_change' 
       AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    // If there's an active code that expires in more than 2 minutes, don't send new one
    if (existingCodeResult.rows.length > 0) {
      const existingCode = existingCodeResult.rows[0];
      const expiresAt = new Date(existingCode.expires_at);
      const now = new Date();
      const timeLeft = (expiresAt - now) / 1000 / 60; // minutes

      if (timeLeft > 2) {
        logger.warn(`Password change verification code already sent recently`, {
          userId,
          timeLeftMinutes: Math.ceil(timeLeft)
        });
        
        return res.status(429).json({ 
          error: 'Verification code already sent. Please wait before requesting a new one.',
          timeLeft: Math.ceil(timeLeft)
        });
      }
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store verification code in database
    const result = await db.query(
      `INSERT INTO verification_codes 
       (user_id, email, verification_code, verification_type, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, 'password_change', $4, $5, $6)
       RETURNING id`,
      [userId, userEmail, verificationCode, expiresAt, ipAddress, userAgent]
    );

    // Send verification email
    try {
      await sendPasswordChangeVerificationEmail(userEmail, username, verificationCode);
      
      logger.info(`Password change verification email sent successfully`, {
        userId,
        verificationId: result.rows[0].id,
        email: userEmail
      });

      res.json({
        message: 'Verification code sent to your email address',
        expiresAt: expiresAt.toISOString(),
        email: userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email for security
      });

    } catch (emailError) {
      // If email sending fails, delete the verification code from database
      await db.query('DELETE FROM verification_codes WHERE id = $1', [result.rows[0].id]);
      
      logger.error(`Failed to send password change verification email`, {
        userId,
        error: emailError.message,
        email: userEmail
      });

      res.status(500).json({ 
        error: 'Failed to send verification email. Please try again.' 
      });
    }

  } catch (error) {
    logger.error(`Password change verification request error`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify password change code
const verifyPasswordChangeCode = async (req, res) => {
  const { verificationCode } = req.body;

  try {
    const userId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    logger.info(`Password change verification code submitted`, { 
      userId,
      ip: ipAddress
    });

    // Validate input
    if (!verificationCode || verificationCode.length !== 6) {
      logger.warn(`Invalid verification code format`, { userId });
      return res.status(400).json({ error: 'Invalid verification code format' });
    }

    // Find valid verification code
    const result = await db.query(
      `SELECT id, expires_at FROM verification_codes 
       WHERE user_id = $1 AND verification_code = $2 
       AND verification_type = 'password_change' AND is_used = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [userId, verificationCode]
    );

    if (result.rows.length === 0) {
      logger.warn(`Invalid or expired verification code`, { 
        userId,
        submittedCode: verificationCode
      });
      return res.status(401).json({ error: 'Invalid or expired verification code' });
    }

    const verificationRecord = result.rows[0];
    const expiresAt = new Date(verificationRecord.expires_at);
    const now = new Date();

    // Check if code is expired
    if (now > expiresAt) {
      logger.warn(`Expired verification code submitted`, { 
        userId,
        expiredAt: expiresAt.toISOString()
      });
      return res.status(401).json({ error: 'Verification code has expired' });
    }

    // Mark code as used
    await db.query(
      `UPDATE verification_codes 
       SET is_used = TRUE, used_at = NOW() 
       WHERE id = $1`,
      [verificationRecord.id]
    );

    // Log successful verification
    logger.userActivity('password_change_verification_success', {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }, {
      ip: ipAddress,
      userAgent: userAgent,
      verificationId: verificationRecord.id,
      timestamp: new Date().toISOString()
    });

    res.json({ 
      message: 'Verification successful',
      verified: true 
    });

  } catch (error) {
    logger.error(`Password change verification error`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ error: 'Server error' });
  }
};

// Get verification status (for UI state management)
const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT expires_at, is_used 
       FROM verification_codes 
       WHERE user_id = $1 AND verification_type = 'password_change'
       AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ 
        hasActiveVerification: false,
        isVerified: false 
      });
    }

    const verification = result.rows[0];
    const expiresAt = new Date(verification.expires_at);
    const now = new Date();
    const timeLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000 / 60)); // minutes

    res.json({
      hasActiveVerification: true,
      isVerified: verification.is_used,
      expiresAt: verification.expires_at,
      timeLeftMinutes: timeLeft
    });

  } catch (error) {
    logger.error(`Get verification status error`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  requestPasswordChangeVerification,
  verifyPasswordChangeCode,
  getVerificationStatus
}; 