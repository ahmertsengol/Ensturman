// models/User.js - User model for authentication
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');
const logger = require('../config/logger');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      // Şifre hash'leme devre dışı, şifreyi olduğu gibi saklayacağız
      logger.debug(`Saving plain text password for new user: ${user.email}`);
      // user.password değiştirilmeden bırakılıyor (hash'lenmiyor)
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        // Şifre hash'leme devre dışı, şifreyi olduğu gibi saklayacağız
        logger.debug(`Saving updated plain text password for user: ${user.email}`);
        // user.password değiştirilmeden bırakılıyor (hash'lenmiyor)
      }
    }
  }
});

// Instance method to compare passwords - basitleştirilmiş direkt karşılaştırma
User.prototype.matchPassword = async function(enteredPassword) {
  try {
    logger.debug(`Comparing password for user: ${this.email}`);
    
    // Boş şifre kontrolü
    if (!enteredPassword) {
      logger.warn(`Empty password provided for user: ${this.email}`);
      return false;
    }
    
    // Trim the password to remove any whitespace
    const trimmedPassword = enteredPassword.trim();
    
    // Direkt şifre karşılaştırması
    const isMatch = (trimmedPassword === this.password);
    logger.debug(`Plain text password comparison for ${this.email}: ${isMatch}`);
    logger.debug(`Entered password: ${trimmedPassword}`);
    logger.debug(`Stored password: ${this.password}`);
    
    return isMatch;
  } catch (error) {
    logger.error(`Error comparing password: ${error.message}`);
    return false;
  }
};

module.exports = User; 