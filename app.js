// app.js - Main application file
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const fs = require('fs');

// Import logger
const logger = require('./config/logger');
const morganMiddleware = require('./middlewares/morgan');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  logger.info('Logs directory created');
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  logger.info('Uploads directory created');
}

// Load config
dotenv.config();
logger.info('Environment variables loaded');

// Database connection
const { connectDB, sequelize } = require('./config/db');
connectDB();

// Passport config
require('./config/passport')(passport);
logger.info('Passport configured');

// Initialize app
const app = express();
logger.info('Express app initialized');

// Apply HTTP request logging middleware
app.use(morganMiddleware);
logger.info('Morgan logging middleware applied');

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
logger.info('Body parsers configured');

// Session middleware with Sequelize store
const sessionStore = new SequelizeStore({
  db: sequelize
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);
logger.info('Session middleware configured');

// Create session table if it doesn't exist
sessionStore.sync();
logger.info('Session store synchronized');

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
logger.info('Passport middleware applied');

// Flash message middleware
app.use(require('./middlewares/flash'));
logger.info('Flash message middleware applied');

// Set global variable
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
logger.info('Global middleware applied');

// Static folder
app.use(express.static(path.join(__dirname, 'public')));
logger.info('Static file middleware applied');

// Uploads folder - make accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
logger.info('Uploads directory exposed');

// Method override for PUT and DELETE - check both body and query parameters
app.use((req, res, next) => {
  // Check body parameters (form submissions)
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  
  // Check query parameters (URL parameters)
  if (req.query && req.query._method) {
    req.method = req.query._method;
    delete req.query._method;
  }
  
  next();
});
logger.info('Method override middleware applied');

// Set view engine
app.set('views', path.join(__dirname, 'views'));
logger.info('View engine configured');

// Override res.render to use HTML files
const originalSendFile = express.response.sendFile;
app.use((req, res, next) => {
  res.render = function(view, options) {
    const viewPath = path.join(app.get('views'), `${view}.html`);
    originalSendFile.call(this, viewPath);
  };
  next();
});
logger.info('Render override configured');

// Routes
app.use('/', require('./routes/index'));
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
app.use('/', authRoutes); // Mount auth routes at root as well
app.use('/recordings', require('./routes/recordings'));
app.use('/api', require('./routes/api'));

logger.info('Routes registered');

// Error routes
app.use((req, res) => {
  logger.warn(`404 - Not Found: ${req.originalUrl}`);
  res.status(404).render('error/404');
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack);
  res.status(500).render('error/500');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info('Press Ctrl+C to stop the server');
}); 