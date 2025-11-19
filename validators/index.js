/**
 * Centralized validation functions
 * Reusable validators for common data types
 */

import { ValidationError } from '../errors';

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  return email.toLowerCase().trim();
}

/**
 * Validate password
 */
export function validatePassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required');
  }

  if (password.length < minLength) {
    throw new ValidationError(`Password must be at least ${minLength} characters`);
  }

  return password;
}

/**
 * Validate name
 */
export function validateName(name, fieldName = 'Name') {
  if (!name || typeof name !== 'string') {
    throw new ValidationError(`${fieldName} is required`);
  }

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw new ValidationError(`${fieldName} must be at least 2 characters`);
  }

  if (trimmed.length > 100) {
    throw new ValidationError(`${fieldName} must be less than 100 characters`);
  }

  return trimmed;
}

/**
 * Validate file
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedMimeTypes = null,
    required = true,
  } = options;

  if (!file) {
    if (required) {
      throw new ValidationError('File is required');
    }
    return null;
  }

  // Check file size
  if (file.size > maxSize) {
    throw new ValidationError(
      `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`
    );
  }

  // Check mime type
  if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
    );
  }

  return file;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page, limit, maxLimit = 100) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;

  if (pageNum < 1) {
    throw new ValidationError('Page must be greater than 0');
  }

  if (limitNum < 1) {
    throw new ValidationError('Limit must be greater than 0');
  }

  if (limitNum > maxLimit) {
    throw new ValidationError(`Limit cannot exceed ${maxLimit}`);
  }

  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  };
}

/**
 * Validate UUID
 */
export function validateUUID(uuid, fieldName = 'ID') {
  if (!uuid || typeof uuid !== 'string') {
    throw new ValidationError(`${fieldName} is required`);
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    throw new ValidationError(`Invalid ${fieldName} format`);
  }

  return uuid;
}

/**
 * Validate required fields
 */
export function validateRequired(data, fields) {
  const missing = fields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`
    );
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(str, maxLength = null) {
  if (typeof str !== 'string') {
    return '';
  }

  let sanitized = str.trim();
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

