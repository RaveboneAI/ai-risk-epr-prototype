/**
 * API Routes
 */

const express = require('express');
const router = express.Router();
const { validatePatientId, validateMode } = require('../middleware/validation');
const { cacheMiddleware } = require('../utils/cache');
const patientController = require('../controllers/patientController');

// Patient routes
router.get('/patients', 
  cacheMiddleware(300), // Cache for 5 minutes
  patientController.getAllPatients
);

router.get('/patients/search',
  patientController.searchPatients
);

router.get('/patients/:id',
  validatePatientId,
  validateMode,
  cacheMiddleware(60), // Cache for 1 minute
  patientController.getPatientById
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;

