const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { authenticateToken } = require('../middlewares/auth');

// All training routes require authentication
router.use(authenticateToken);

// Training modules routes
router.post('/modules', trainingController.createTrainingModule);
router.get('/modules', trainingController.getTrainingModules);
router.get('/modules/:id', trainingController.getTrainingModule);

// Training sessions routes
router.post('/sessions', trainingController.saveTrainingSession);
router.get('/history', trainingController.getUserTrainingHistory);
router.get('/progress', trainingController.getUserProgress);

module.exports = router; 