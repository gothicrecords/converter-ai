/**
 * File Service
 * Centralized file handling logic
 */

import fs from 'fs/promises';
import path from 'path';
import { ValidationError } from '../../errors';
import { validateFile } from '../../validators';
import { config } from '../../config';

/**
 * Validate and process uploaded file
 */
export async function processUploadedFile(file, options = {}) {
  const {
    allowedMimeTypes = null,
    maxSize = config.upload.maxFileSize,
    required = true,
  } = options;

  // Validate file
  validateFile(file, { maxSize, allowedMimeTypes, required });

  // Read file buffer
  const filePath = file.filepath || file.path;
  if (!filePath) {
    throw new ValidationError('File path is missing');
  }

  const buffer = await fs.readFile(filePath);
  
  if (!buffer || buffer.length === 0) {
    throw new ValidationError('File is empty or corrupted');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const ext = path.extname(file.originalFilename || file.newFilename || '');
  const filename = `${timestamp}_${randomString}${ext}`;

  return {
    buffer,
    filename,
    originalFilename: file.originalFilename || file.newFilename,
    mimetype: file.mimetype,
    size: file.size,
    tempPath: filePath,
  };
}

/**
 * Cleanup temporary file
 */
export async function cleanupTempFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore errors during cleanup
    console.warn('Failed to cleanup temp file:', error.message);
  }
}

/**
 * Generate file metadata
 */
export function generateFileMetadata(file, userId) {
  return {
    userId,
    filename: file.filename,
    originalFilename: file.originalFilename,
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  };
}

/**
 * Get file extension from mimetype
 */
export function getExtensionFromMimeType(mimetype) {
  const mimeMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
  };

  return mimeMap[mimetype] || '';
}

