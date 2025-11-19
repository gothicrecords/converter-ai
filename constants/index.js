/**
 * Application constants
 * Centralized constants for consistency across the application
 */

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// File types
export const FILE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
};

// User plans
export const USER_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium',
};

// Subscription status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
};

// Processing status
export const PROCESSING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Tool categories
export const TOOL_CATEGORIES = {
  IMAGES: 'Immagini',
  AUDIO: 'Audio',
  TEXT: 'Testo',
  PDF: 'PDF',
  VIDEO: 'Video',
};

// Rate limits
export const RATE_LIMITS = {
  FREE: {
    imagesPerDay: 10,
    toolsPerDay: 5,
  },
  PRO: {
    imagesPerDay: 1000,
    toolsPerDay: 500,
  },
  PREMIUM: {
    imagesPerDay: -1, // unlimited
    toolsPerDay: -1, // unlimited
  },
};

// Default pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Session
export const SESSION = {
  COOKIE_NAME: 'megapixelai_session',
  USER_CACHE_KEY: 'megapixelai_user_cache',
  MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Error messages
export const ERROR_MESSAGES = {
  AUTHENTICATION_REQUIRED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  USER_NOT_FOUND: 'User not found',
  FILE_NOT_FOUND: 'File not found',
  FILE_TOO_LARGE: 'File too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INTERNAL_ERROR: 'Internal server error',
};

// Success messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_DELETED: 'File deleted successfully',
};

