/**
 * Caching utility using node-cache
 */

const NodeCache = require('node-cache');
const config = require('../config');
const logger = require('./logger');

const cache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.checkPeriod
});

// Log cache statistics periodically
cache.on('set', (key, value) => {
  logger.debug(`Cache SET: ${key}`);
});

cache.on('del', (key, value) => {
  logger.debug(`Cache DEL: ${key}`);
});

cache.on('expired', (key, value) => {
  logger.debug(`Cache EXPIRED: ${key}`);
});

const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      logger.debug(`Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method
    res.json = (body) => {
      cache.set(key, body, duration || config.cache.ttl);
      logger.debug(`Cache MISS: ${key}`);
      return originalJson(body);
    };

    next();
  };
};

module.exports = {
  cache,
  cacheMiddleware
};

