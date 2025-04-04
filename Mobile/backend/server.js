const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the updates directory
app.use('/uploads', express.static(path.join(__dirname, '../updates')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recordings', require('./routes/recordings'));

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 