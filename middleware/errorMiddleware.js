/**
 * Error Middleware for Next.js API Routes
 * Automatically catches and handles errors with advanced tracking
 */

import { handleApiError } from '../errors/index.js';
import { log } from '../lib/logger.js';
import errorTracker from '../lib/errorTracker.js';

/**
 * Wrapper for async API route handlers with automatic error handling
 */
export function asyncHandler(handler) {
  return async (req, res) => {
    const startTime = Date.now();
    
    try {
      await handler(req, res);
      
      // Log successful request
      const duration = Date.now() - startTime;
      log.api(req, res, duration);
    } catch (error) {
      // Track error
      await errorTracker.trackError(error, {
        method: req.method,
        url: req.url,
        path: req.path,
        query: req.query,
        body: req.body,
        user: req.user?.id,
      });

      // Handle error
      await handleApiError(error, res, {
        method: req.method,
        url: req.url,
        path: req.path,
      });
    }
  };
}

/**
 * Request logging middleware
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    log.api(req, res, duration);
  });

  if (next) next();
}

export default {
  asyncHandler,
  requestLogger,
};

