const fs = require('fs');
const path = require('path');
const db = require('../db');

// Paths to migration files
const trainingTablesPath = path.join(__dirname, 'training_tables.sql');

// Run migrations
async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // Read SQL file content
    const trainingTablesSql = fs.readFileSync(trainingTablesPath, 'utf8');
    
    // Execute SQL for training tables
    console.log('Creating training tables...');
    await db.query(trainingTablesSql);
    console.log('Training tables created successfully!');
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await db.pool.end();
  }
}

// Run the migrations
runMigrations(); 