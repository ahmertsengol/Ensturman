// config/db.js - Database connection configuration
const { Sequelize } = require('sequelize');

// PostgreSQL connection
const sequelize = new Sequelize(
  process.env.PG_DATABASE || 'voice_recorder',
  process.env.PG_USER || 'postgres',
  process.env.PG_PASSWORD || 'postgres',
  {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
    console.log('PostgreSQL Connection has been established successfully.');
    
    // Sync models with database
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize }; 