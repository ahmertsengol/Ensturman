// script to run cleanup SQL
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');
const logger = require('../../utils/logger');

const cleanupFile = path.join(__dirname, 'cleanup_unused_tables.sql');

async function runCleanup() {
  let client;
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync(cleanupFile, 'utf8');
    
    logger.info('Starting database cleanup of unused tables');
    
    // Get a client from the pool
    client = await pool.connect();
    
    // Execute the SQL
    const result = await client.query(sql);
    
    logger.info('Database cleanup completed successfully');
    
    // Check if we got a result
    if (result && result.rows && result.rows.length > 0) {
      console.log('Cleanup result:', result.rows[0].message);
    } else {
      console.log('Cleanup completed, but no result message was returned');
    }
    
    return true;
  } catch (error) {
    logger.error('Error during database cleanup', { error: error.message });
    console.error('Error during cleanup:', error.message);
    return false;
  } finally {
    // Always release the client back to the pool
    if (client) {
      client.release();
    }
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  runCleanup().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runCleanup }; 