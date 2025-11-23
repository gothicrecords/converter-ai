import formidable from 'formidable';
import fs from 'fs/promises';
import upscaleImage from '../../utils/upscale.js';
import { upscaleImageWithDALLE } from '../../lib/openai.js';
import { 
  handleApiError, 
  ValidationError, 
  FileTooLargeError, 
  InvalidFileTypeError,
  TimeoutError,
  ProcessingError,
  FileSystemError
} from '../../errors';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
  }

  // Set timeout for long-running operations
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const TIMEOUT_MS = 120000; // 2 minutes

  const form = formidable({ 
    multiples: false,
    maxFileSize: MAX_FILE_SIZE,
    keepExtensions: true,
  });

  let filePath = null;

  try {
    // Support both callback and promise styles robustly
    const parsed = await Promise.race([
      new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            // Handle formidable-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
              return reject(new FileTooLargeError(MAX_FILE_SIZE));
            }
            return reject(new ValidationError('File upload failed: ' + err.message, err));
          }
          resolve({ fields, files });
        });
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new TimeoutError('Request timeout', TIMEOUT_MS)), TIMEOUT_MS)
      )
    ]);

    const { files } = parsed;

    // Accept 'image' or 'file' field names; normalize array/single
    let file = files?.image ?? files?.file ?? null;
    if (Array.isArray(file)) file = file[0];

    if (!file) {
      throw new ValidationError('No file uploaded');
    }

    // Validate file type
    if (!file.mimetype?.startsWith('image/')) {
      throw new InvalidFileTypeError(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new FileTooLargeError(MAX_FILE_SIZE, file.size);
    }

    filePath = file.filepath || file.path; // v3 vs older
    if (!filePath) {
      throw new ValidationError('Uploaded file path missing');
    }

    let buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch (readError) {
      throw new FileSystemError('Failed to read uploaded file', readError);
    }
    
    // Validate buffer is not empty
    if (!buffer || buffer.length === 0) {
      throw new ValidationError('File is empty or corrupted');
    }

    let upscaledBuffer;
    try {
      // Try OpenAI DALL-E upscaling first if API key is available
      if (process.env.OPENAI_API_KEY) {
        console.log('Using OpenAI DALL-E for image upscaling');
        const mimeType = file.mimetype || 'image/jpeg';
        upscaledBuffer = await upscaleImageWithDALLE(buffer, mimeType);
        
        // Convert buffer to data URL
        const base64 = upscaledBuffer.toString('base64');
        const url = `data:${mimeType};base64,${base64}`;
        
        // Cleanup temp file
        if (filePath) {
          try { 
            await fs.unlink(filePath);
            filePath = null;
          } catch (cleanupError) {
            console.warn('Failed to cleanup temp file:', cleanupError);
          }
        }
        
        return res.status(200).json({ url });
      } else {
        // Fallback to local upscaler
        console.log('Using local upscaler (OpenAI API key not configured)');
        const url = await upscaleImage(buffer);
        
        // Cleanup temp file
        if (filePath) {
          try { 
            await fs.unlink(filePath);
            filePath = null;
          } catch (cleanupError) {
            console.warn('Failed to cleanup temp file:', cleanupError);
          }
        }
        
        return res.status(200).json({ url });
      }
    } catch (upscaleError) {
      // If OpenAI fails, try local upscaler as fallback
      if (process.env.OPENAI_API_KEY && upscaleError.message) {
        console.warn('OpenAI upscaling failed, trying local upscaler:', upscaleError.message);
        try {
          const url = await upscaleImage(buffer);
          
          // Cleanup temp file
          if (filePath) {
            try { 
              await fs.unlink(filePath);
              filePath = null;
            } catch (cleanupError) {
              console.warn('Failed to cleanup temp file:', cleanupError);
            }
          }
          
          return res.status(200).json({ url });
        } catch (fallbackError) {
          throw new ProcessingError('Failed to upscale image with both OpenAI and local methods', fallbackError);
        }
      } else {
        throw new ProcessingError('Failed to upscale image', upscaleError);
      }
    }

  } catch (error) {
    // Cleanup on error
    if (filePath) {
      try { 
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file on error:', cleanupError);
      }
    }

    // Use centralized error handler
    handleApiError(error, res, {
      method: req.method,
      url: req.url,
      endpoint: '/api/upscale',
    });
  }
}
