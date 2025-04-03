const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function setupDatabase() {
  try {
    // Read schema SQL file
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Connect to PostgreSQL
    const client = await pool.connect();
    
    try {
      console.log('Connected to database. Creating tables...');
      
      // Execute schema SQL
      await client.query(schemaSQL);
      
      console.log('Database tables created successfully!');
    } finally {
      // Release client back to pool
      client.release();
    }
    
    // Close pool
    await pool.end();
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 