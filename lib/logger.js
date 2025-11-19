/**
 * Advanced Structured Logging System
 * Provides comprehensive logging with different levels, transports, and error tracking
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0 && meta.stack) {
      msg += `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Create Winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: {
    service: 'upscaler-ai',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? winston.format.json()
        : consoleFormat,
      handleExceptions: true,
      handleRejections: true,
    }),
    
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat,
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 3,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 3,
    }),
  ],
});

// Enhanced logging methods with context
export const log = {
  /**
   * Log error with full context
   */
  error: (message, error = null, context = {}) => {
    const logData = {
      message,
      ...context,
    };

    if (error) {
      logData.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      };
    }

    logger.error(message, logData);
    return logData;
  },

  /**
   * Log warning
   */
  warn: (message, context = {}) => {
    logger.warn(message, context);
  },

  /**
   * Log info
   */
  info: (message, context = {}) => {
    logger.info(message, context);
  },

  /**
   * Log debug (only in development)
   */
  debug: (message, context = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(message, context);
    }
  },

  /**
   * Log API request
   */
  api: (req, res, responseTime = null) => {
    const logData = {
      method: req.method,
      url: req.url,
      path: req.path,
      statusCode: res.statusCode,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
    };

    if (responseTime) {
      logData.responseTime = `${responseTime}ms`;
    }

    if (res.statusCode >= 400) {
      logger.warn('API Request', logData);
    } else {
      logger.info('API Request', logData);
    }
  },

  /**
   * Log database operation
   */
  database: (operation, query = null, duration = null, error = null) => {
    const logData = {
      operation,
      duration: duration ? `${duration}ms` : null,
    };

    if (query) {
      logData.query = typeof query === 'string' ? query : JSON.stringify(query);
    }

    if (error) {
      logger.error('Database Operation Failed', { ...logData, error });
    } else {
      logger.debug('Database Operation', logData);
    }
  },

  /**
   * Log file operation
   */
  file: (operation, filePath, size = null, error = null) => {
    const logData = {
      operation,
      filePath,
      size: size ? `${(size / 1024).toFixed(2)}KB` : null,
    };

    if (error) {
      logger.error('File Operation Failed', { ...logData, error });
    } else {
      logger.debug('File Operation', logData);
    }
  },

  /**
   * Log performance metric
   */
  performance: (operation, duration, context = {}) => {
    logger.info('Performance Metric', {
      operation,
      duration: `${duration}ms`,
      ...context,
    });
  },
};

// Export default logger instance
export default logger;

