/**
 * Centralized error handling
 * Provides consistent error responses and error classes
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, code = null, details = null, originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    this.requestId = null; // Can be set by middleware
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error()).stack;
    }
  }

  /**
   * Convert error to plain object for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
      stack: this.stack,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', retryAfter = null) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', retryAfter ? { retryAfter } : null);
  }
}

export class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, 'DATABASE_ERROR', null, originalError);
  }
}

export class FileSystemError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, 'FILE_SYSTEM_ERROR', null, originalError);
  }
}

export class NetworkError extends AppError {
  constructor(message, originalError = null) {
    super(message, 503, 'NETWORK_ERROR', null, originalError);
  }
}

export class TimeoutError extends AppError {
  constructor(message = 'Request timeout', timeoutMs = null) {
    super(message, 408, 'TIMEOUT_ERROR', timeoutMs ? { timeoutMs } : null);
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxSize, actualSize = null) {
    const message = `File too large. Maximum size is ${formatFileSize(maxSize)}`;
    super(message, 413, 'FILE_TOO_LARGE', { maxSize, actualSize });
  }
}

export class InvalidFileTypeError extends AppError {
  constructor(allowedTypes = null) {
    const message = allowedTypes 
      ? `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      : 'Invalid file type';
    super(message, 400, 'INVALID_FILE_TYPE', { allowedTypes });
  }
}

export class ProcessingError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, 'PROCESSING_ERROR', null, originalError);
  }
}

/**
 * Format file size for human-readable display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Enhanced error logger with advanced tracking
 */
async function logError(error, context = {}) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: error instanceof AppError ? error.toJSON() : {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    environment: process.env.NODE_ENV,
  };

  // Log to console with appropriate level
  if (error instanceof AppError && error.statusCode < 500) {
    // Client errors (4xx) - log as warning
    console.warn('Client Error:', JSON.stringify(errorInfo, null, 2));
  } else {
    // Server errors (5xx) - log as error
    console.error('Server Error:', JSON.stringify(errorInfo, null, 2));
  }

  // Track error with advanced error tracker
  try {
    const { default: errorTracker } = await import('../lib/errorTracker.js');
    const { log } = await import('../lib/logger.js');
    await errorTracker.trackError(error, context);
    log.error('Error logged', error, context);
  } catch (importError) {
    // Error tracker not available, continue with basic logging
    console.warn('Error tracker not available:', importError.message);
  }

  // In production, you might want to send to error tracking service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production' && process.env.ERROR_TRACKING_ENABLED === 'true') {
    // TODO: Integrate with error tracking service
    // trackError(errorInfo);
  }

  return errorInfo;
}

/**
 * Format error response for API
 */
export function formatErrorResponse(error, includeStack = false, includeDetails = true) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = {
    error: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
  };

  // Include details if available and allowed
  if (includeDetails && error.details) {
    response.details = error.details;
  }

  // Include stack trace only in development
  if (includeStack || isDevelopment) {
    response.stack = error.stack;
  }

  // Include request ID if available
  if (error.requestId) {
    response.requestId = error.requestId;
  }

  // Include timestamp
  if (error.timestamp) {
    response.timestamp = error.timestamp;
  }

  return response;
}

/**
 * Handle errors in API routes with improved error resolution
 */
export async function handleApiError(error, res, context = {}) {
  // Log the error with context
  await logError(error, context);

  // If response already sent, just log
  if (res.headersSent) {
    return;
  }

  // Handle known error types
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      formatErrorResponse(error, false, true)
    );
  }

  // Handle specific error types from libraries and Node.js
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json(
      formatErrorResponse(new ValidationError(error.message, error.errors), false)
    );
  }

  // Handle database connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return res.status(503).json(
      formatErrorResponse(
        new NetworkError('Database connection failed', error),
        false
      )
    );
  }

  // Handle file system errors
  if (error.code === 'ENOENT' || error.code === 'EACCES' || error.code === 'EMFILE') {
    return res.status(500).json(
      formatErrorResponse(
        new FileSystemError('File system operation failed', error),
        false
      )
    );
  }

  // Handle timeout errors
  if (error.message && (error.message.includes('timeout') || error.message.includes('ETIMEDOUT'))) {
    return res.status(408).json(
      formatErrorResponse(
        new TimeoutError('Request timeout', error.timeout),
        false
      )
    );
  }

  // Handle file size errors
  if (error.code === 'LIMIT_FILE_SIZE' || error.message?.includes('too large')) {
    return res.status(413).json(
      formatErrorResponse(
        new FileTooLargeError(),
        false
      )
    );
  }

  // Default to 500 with safe error message
  const isDevelopment = process.env.NODE_ENV === 'development';
  const safeMessage = isDevelopment 
    ? error.message || 'Internal server error'
    : 'Internal server error';
  
  res.status(500).json(
    formatErrorResponse(
      new AppError(safeMessage, 500, 'INTERNAL_ERROR', null, error),
      isDevelopment
    )
  );
}

/**
 * Create error handler wrapper for async route handlers
 */
export function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      handleApiError(error, res, {
        method: req.method,
        url: req.url,
        path: req.path,
        query: req.query,
        user: req.user?.id,
      });
    }
  };
}

/**
 * Retry logic for operations that might fail temporarily
 */
export async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error instanceof ValidationError || 
          error instanceof AuthenticationError ||
          error instanceof AuthorizationError) {
        throw error;
      }
      
      // If last attempt, throw error
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

