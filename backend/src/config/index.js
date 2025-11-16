/**
 * Centralized configuration management
 */

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes default
    checkPeriod: 60
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'combined.log',
    errorFile: process.env.ERROR_LOG_FILE || 'error.log'
  }
};

