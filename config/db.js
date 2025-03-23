// config/db.js - Database connection configuration
const { Sequelize } = require('sequelize');
const logger = require('./logger');

// Custom logging function that uses our winston logger
const customLogger = (msg) => {
  if (msg.includes('Executing')) {
    logger.debug(msg);
  } else {
    logger.info(msg);
  }
};

// PostgreSQL connection
const sequelize = new Sequelize(
  process.env.PG_DATABASE || 'voice_recorder',
  process.env.PG_USER || 'postgres',
  process.env.PG_PASSWORD || 'postgres',
  {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? customLogger : false,
    dialectOptions: {
      ssl: process.env.PG_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL Connection has been established successfully.');
    
    // Sync models with database
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database synchronized');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB }; 