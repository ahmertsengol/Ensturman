const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Create a new training module
 */
const createTrainingModule = async (req, res) => {
  try {
    const { title, description, level, notes } = req.body;
    
    if (!title || !notes || !Array.isArray(notes)) {
      return res.status(400).json({ error: 'Title and valid notes array are required' });
    }
    
    // Insert into database
    const result = await db.query(
      'INSERT INTO training_modules (title, description, level, notes, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description || '', level || 1, JSON.stringify(notes), req.user.id]
    );
    
    logger.info('Training module created', {
      userId: req.user.id,
      moduleId: result.rows[0].id
    });
    
    res.status(201).json({
      message: 'Training module created successfully',
      module: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating training module', { error: error.message });
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

/**
 * Get all training modules
 */
const getTrainingModules = async (req, res) => {
  try {
    let query = 'SELECT * FROM training_modules';
    const params = [];
    
    // Filter by level if provided
    if (req.query.level) {
      query += ' WHERE level = $1';
      params.push(req.query.level);
    }
    
    query += ' ORDER BY level ASC, created_at ASC';
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching training modules', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get a single training module
 */
const getTrainingModule = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM training_modules WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training module not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching training module', { 
      error: error.message,
      moduleId: req.params.id 
    });
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Save training session data
 */
const saveTrainingSession = async (req, res) => {
  try {
    const { module_id, notes_played, accuracy, duration, completed } = req.body;
    
    if (!module_id || !notes_played) {
      return res.status(400).json({ error: 'Module ID and notes played data are required' });
    }
    
    // Verify training module exists
    const moduleCheck = await db.query(
      'SELECT id FROM training_modules WHERE id = $1',
      [module_id]
    );
    
    if (moduleCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Training module not found' });
    }
    
    // Insert training session
    const result = await db.query(
      'INSERT INTO training_sessions (user_id, module_id, notes_played, accuracy, duration, completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, module_id, JSON.stringify(notes_played), accuracy || 0, duration || 0, completed || false]
    );
    
    logger.info('Training session saved', {
      userId: req.user.id,
      sessionId: result.rows[0].id,
      moduleId: module_id
    });
    
    res.status(201).json({
      message: 'Training session saved successfully',
      session: result.rows[0]
    });
  } catch (error) {
    logger.error('Error saving training session', { error: error.message });
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

/**
 * Get user training history
 */
const getUserTrainingHistory = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, m.title as module_title, m.level as module_level 
       FROM training_sessions s
       JOIN training_modules m ON s.module_id = m.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching user training history', { 
      error: error.message,
      userId: req.user.id 
    });
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get user progress summary
 */
const getUserProgress = async (req, res) => {
  try {
    // Get completed modules count
    const completedModulesResult = await db.query(
      `SELECT COUNT(DISTINCT module_id) as completed_modules
       FROM training_sessions
       WHERE user_id = $1 AND completed = true`,
      [req.user.id]
    );
    
    // Get average accuracy
    const accuracyResult = await db.query(
      `SELECT AVG(accuracy) as average_accuracy
       FROM training_sessions
       WHERE user_id = $1`,
      [req.user.id]
    );
    
    // Get highest level completed
    const levelResult = await db.query(
      `SELECT MAX(m.level) as highest_level
       FROM training_sessions s
       JOIN training_modules m ON s.module_id = m.id
       WHERE s.user_id = $1 AND s.completed = true`,
      [req.user.id]
    );
    
    // Get total practice time
    const timeResult = await db.query(
      `SELECT SUM(duration) as total_practice_time
       FROM training_sessions
       WHERE user_id = $1`,
      [req.user.id]
    );
    
    res.json({
      completed_modules: completedModulesResult.rows[0].completed_modules || 0,
      average_accuracy: accuracyResult.rows[0].average_accuracy || 0,
      highest_level: levelResult.rows[0].highest_level || 0,
      total_practice_time: timeResult.rows[0].total_practice_time || 0
    });
  } catch (error) {
    logger.error('Error fetching user progress', { 
      error: error.message,
      userId: req.user.id 
    });
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createTrainingModule,
  getTrainingModules,
  getTrainingModule,
  saveTrainingSession,
  getUserTrainingHistory,
  getUserProgress
}; 