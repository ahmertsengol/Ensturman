# EnsAI - Backend API

Backend API service for EnsAI (AI-Powered Instrument Learning Platform). Provides user authentication, audio recording management, training modules, and AI integration for instrument learning.

## Technologies

- Node.js
- Express.js
- MongoDB (Mongoose) & PostgreSQL
- JWT Authentication
- Multer for file uploads
- AI Integration Ready

## Features

- **User Authentication**: JWT-based authentication system
- **Audio Processing**: Upload and manage audio recordings (MP3, WAV, OGG)
- **Training Modules**: AI-powered music training system
- **2FA Security**: Email-based two-factor authentication for password changes
- **Database**: PostgreSQL with proper migrations
- **Logging**: Comprehensive logging system
- **File Upload**: Secure file upload with validation

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables in `.env` file:
   ```
   PORT=3001
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=EnsAI
   JWT_SECRET=ensai_instrument_learning_app_secret_key
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_USER=example@example.com
   EMAIL_PASSWORD=your_app_password_here
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout (protected)
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/change-password` - Change password (requires 2FA)

### Audio Management
- `POST /api/audio/upload` - Upload audio file (protected)
- `GET /api/audio` - Get user audio recordings (protected)
- `GET /api/audio/stream/:filename` - Stream audio file
- `GET /api/audio/:id` - Get specific recording (protected)
- `DELETE /api/audio/:id` - Delete recording (protected)

### Training Modules (AI-Powered)
- `POST /api/training/modules` - Create training module (protected)
- `GET /api/training/modules` - List training modules (protected)
- `GET /api/training/modules/:id` - Get specific module (protected)
- `POST /api/training/sessions` - Save training session (protected)
- `GET /api/training/history` - Get user training history (protected)
- `GET /api/training/progress` - Get user progress report (protected)

### Utility
- `GET /health` - Server health check
- `GET /test-cors` - CORS test endpoint

### 2FA Verification
- `POST /api/verification/password-change/request` - Request 2FA code
- `POST /api/verification/password-change/verify` - Verify 2FA code
- `GET /api/verification/password-change/status` - Get verification status

## AI Features

- Gemini AI integration
- Instrument learning assistant
- Audio analysis and pitch detection
- Personalized training recommendations

## Folder Structure

- `src/config` - Database and configuration files
- `src/controllers` - Route controllers
- `src/middlewares` - Express middlewares
- `src/routes` - API routes
- `src/utils` - Utility functions
- `uploads` - Audio files storage directory

## Security Features

### Two-Factor Authentication (2FA)
- Email-based verification for password changes
- 6-digit verification codes
- 10-minute expiration time
- Rate limiting to prevent abuse
- Secure email templates with EnsAI branding

### Password Security
- Minimum 8 characters
- bcrypt hashing with salt
- Current password verification required
- Prevention of password reuse

### File Upload Security
- File type validation (MP3, WAV, OGG only)
- File size limits (10MB max)
- Secure file storage
- Proper error handling

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `password` - Hashed password
- `created_at` - Registration timestamp
- `updated_at` - Last update timestamp

### Verification Codes Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `email` - User email
- `verification_code` - 6-digit code
- `verification_type` - Type of verification
- `is_used` - Whether code was used
- `expires_at` - Expiration timestamp
- `created_at` - Creation timestamp
- `ip_address` - Request IP address
- `user_agent` - Request user agent

## Development

### Logging
The application uses a comprehensive logging system:
- Request/response logging
- User activity tracking
- Error logging with stack traces
- Security event logging

### Error Handling
- Centralized error handling middleware
- Proper HTTP status codes
- User-friendly error messages
- Development vs production error details

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a professional email service
3. Configure proper database connection
4. Set up SSL/TLS certificates
5. Configure reverse proxy (nginx)
6. Set up monitoring and logging
7. Regular database backups

## License

MIT License