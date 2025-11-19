/**
 * API Request Helpers
 * Utilities for parsing and validating request data
 */

import formidable from 'formidable';
import { ValidationError } from '../../errors';
import { config } from '../../config';

/**
 * Parse JSON body
 */
export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new ValidationError('Invalid JSON body'));
      }
    });
    
    req.on('error', reject);
  });
}

/**
 * Parse multipart form data (file upload)
 */
export function parseFormData(req, options = {}) {
  const {
    maxFileSize = config.upload.maxFileSize,
    multiples = false,
    keepExtensions = true,
  } = options;

  const form = formidable({
    multiples,
    maxFileSize,
    keepExtensions,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(new ValidationError(err.message));
        return;
      }

      // Normalize fields and files (formidable returns arrays)
      const normalizedFields = {};
      const normalizedFiles = {};

      Object.keys(fields).forEach(key => {
        const value = fields[key];
        normalizedFields[key] = Array.isArray(value) ? value[0] : value;
      });

      Object.keys(files).forEach(key => {
        const value = files[key];
        normalizedFiles[key] = Array.isArray(value) ? value[0] : value;
      });

      resolve({ fields: normalizedFields, files: normalizedFiles });
    });
  });
}

/**
 * Get file from request (supports both 'file' and 'image' field names)
 */
export function getFileFromRequest(files) {
  const file = files?.file || files?.image || null;
  
  if (!file) {
    throw new ValidationError('No file uploaded');
  }

  return file;
}

/**
 * Get query parameters with defaults
 */
export function getQueryParams(req, defaults = {}) {
  const params = { ...defaults };
  
  Object.keys(req.query).forEach(key => {
    const value = req.query[key];
    if (value !== undefined && value !== null) {
      params[key] = value;
    }
  });

  return params;
}

