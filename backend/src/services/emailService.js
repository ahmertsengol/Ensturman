const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email transporter configuration
const createTransporter = () => {
  // For development/testing, you can use Gmail SMTP
  // For production, use a service like SendGrid, AWS SES, etc.
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        /* 
            EMAIL_USER=ahmertsengol@gmail.com
            EMAIL_PASSWORD=lrhj tmht rhvn kwkb
        */
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD 
    }
  });
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email for password change
const sendPasswordChangeVerificationEmail = async (userEmail, username, verificationCode) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'EnsAI Security',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'EnsAI - Password Change Verification Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Change Verification</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: linear-gradient(135deg, #1DB954, #1ed760);
              border-radius: 15px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .logo {
              font-size: 2.5em;
              font-weight: bold;
              color: white;
              margin-bottom: 10px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .tagline {
              color: rgba(255,255,255,0.9);
              font-size: 1.1em;
              margin-bottom: 30px;
            }
            .content {
              background: white;
              border-radius: 10px;
              padding: 30px;
              margin: 20px 0;
              text-align: left;
            }
            .verification-code {
              background: linear-gradient(45deg, #1DB954, #E91E63);
              color: white;
              font-size: 2.5em;
              font-weight: bold;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              margin: 20px 0;
              letter-spacing: 8px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer {
              color: rgba(255,255,255,0.8);
              font-size: 0.9em;
              margin-top: 20px;
            }
            .security-tip {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 15px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🎵 EnsAI</div>
            <div class="tagline">AI-Powered Instrument Learning Platform</div>
            
            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Password Change Verification</h2>
              
              <p>Hello <strong>${username}</strong>,</p>
              
              <p>We received a request to change your password. To ensure the security of your account, please verify this action with the code below:</p>
              
              <div class="verification-code">${verificationCode}</div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This code will expire in 10 minutes. If you did not request this password change, please ignore this email and contact our support team immediately.
              </div>
              
              <div class="security-tip">
                <strong>🔒 Security Tip:</strong> Never share this verification code with anyone. EnsAI staff will never ask for your verification codes.
              </div>
              
              <p><strong>Next steps:</strong></p>
              <ol>
                <li>Return to the EnsAI password change page</li>
                <li>Enter the verification code above</li>
                <li>Complete your password change</li>
              </ol>
              
              <p>If you have any questions or concerns, feel free to contact our support team.</p>
              
              <p>Best regards,<br><strong>EnsAI Security Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This is an automated security email from EnsAI.<br>
              Please do not reply to this email.</p>
              <p>© 2024 EnsAI - AI-Powered Instrument Learning Platform</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        EnsAI - Password Change Verification

        Hello ${username},

        We received a request to change your password. To ensure the security of your account, please verify this action with the following code:

        Verification Code: ${verificationCode}

        This code will expire in 10 minutes.

        If you did not request this password change, please ignore this email and contact our support team.

        Next steps:
        1. Return to the EnsAI password change page
        2. Enter the verification code: ${verificationCode}
        3. Complete your password change

        Best regards,
        EnsAI Security Team

        © 2024 EnsAI - AI-Powered Instrument Learning Platform
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info('Password change verification email sent successfully', {
      to: userEmail,
      messageId: result.messageId,
      verificationCode: verificationCode // In production, don't log the actual code
    });

    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    logger.error('Failed to send password change verification email', {
      error: error.message,
      stack: error.stack,
      to: userEmail
    });
    
    throw new Error('Failed to send verification email');
  }
};

// Test email configuration
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email service connection verified successfully');
    return true;
  } catch (error) {
    logger.error('Email service connection failed', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};

module.exports = {
  generateVerificationCode,
  sendPasswordChangeVerificationEmail,
  testEmailConnection
}; 