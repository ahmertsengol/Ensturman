// app.js - Main application file
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Load config
dotenv.config();

// Database connection
const { connectDB, sequelize } = require('./config/db');
connectDB();

// Passport config
require('./config/passport')(passport);

// Initialize app
const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

// Create session table if it doesn't exist
sessionStore.sync();

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash message middleware
app.use(require('./middlewares/flash'));

// Set global variable
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Uploads folder - make accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Method override for PUT and DELETE
app.use((req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
});

// Set view engine
app.set('views', path.join(__dirname, 'views'));

// Override res.render to use HTML files
const originalSendFile = express.response.sendFile;
app.use((req, res, next) => {
  res.render = function(view, options) {
    const viewPath = path.join(app.get('views'), `${view}.html`);
    originalSendFile.call(this, viewPath);
  };
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/recordings', require('./routes/recordings'));
app.use('/api', require('./routes/api'));

// Error routes
app.use((req, res) => {
  res.status(404).render('error/404');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 