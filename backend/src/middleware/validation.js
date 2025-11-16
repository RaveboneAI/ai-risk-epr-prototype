/**
 * Input validation middleware
 */

const { AppError } = require('./errorHandler');

const validatePatientId = (req, res, next) => {
  const { id } = req.params;
  
  // Validate format (p001, p002, etc.)
  if (!/^p\d{3}$/.test(id)) {
    return next(new AppError('Invalid patient ID format. Expected format: p001', 400));
  }
  
  next();
};

const validateMode = (req, res, next) => {
  const { mode } = req.query;
  
  if (mode && !['demo', 'guideline'].includes(mode)) {
    return next(new AppError('Invalid mode. Must be "demo" or "guideline"', 400));
  }
  
  next();
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and potentially dangerous characters
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

module.exports = {
  validatePatientId,
  validateMode,
  sanitizeInput
};

