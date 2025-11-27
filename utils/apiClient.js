/**
 * API Client - Centralized API calls with automatic fallback
 * Uses Python backend if available, otherwise falls back to Next.js API routes
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Rate limit handling
 * - Request/response interceptors
 * - Error handling and transformation
 * - Request cancellation support
 */
import { getApiUrl, getApiUrlSync, resetBackendStatusCache } from './getApiUrl';

// Request timeout (30 seconds)
const DEFAULT_TIMEOUT = 30000;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error, response) {
  if (!response) {
    // Network errors are retryable
    return true;
  }
  
  // Retry on 5xx errors and 429 (rate limit)
  const status = response.status;
  return status >= 500 || status === 429 || status === 408;
}

/**
 * Make API call with automatic fallback and retry logic
 * @param {string} endpoint - API endpoint (e.g., '/api/tools/upscale')
 * @param {object} options - Fetch options
 * @param {boolean} retryWithFallback - If true, retry with Next.js API on error
 * @param {number} retries - Number of retries remaining
 */
export async function apiCall(endpoint, options = {}, retryWithFallback = true, retries = MAX_RETRIES) {
  const defaultOptions = {
    headers: {
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
  };
  
  // Don't set Content-Type for FormData - browser will set it with boundary
  if (!(options.body instanceof FormData)) {
    defaultOptions.headers['Content-Type'] = 'application/json';
  }
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  // Get URL (async, checks backend availability)
  let url;
  try {
    url = await getApiUrl(endpoint);
  } catch (error) {
    // Se getApiUrl fallisce, usa versione sync
    url = getApiUrlSync(endpoint);
  }
  
  // Add timeout support
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const retryAfterMs = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
      
      if (retries > 0) {
        await sleep(retryAfterMs);
        return apiCall(endpoint, options, retryWithFallback, retries - 1);
      }
    }
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        // Check if error is retryable
        if (isRetryableError(null, response) && retries > 0) {
          const delay = RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
          await sleep(delay);
          return apiCall(endpoint, options, retryWithFallback, retries - 1);
        }
        
        const error = new Error(data.error || data.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.code = data.code;
        error.details = data.details;
        throw error;
      }
      
      return data;
    } else {
      // For blob responses (images, files)
      if (!response.ok) {
        if (isRetryableError(null, response) && retries > 0) {
          const delay = RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
          await sleep(delay);
          return apiCall(endpoint, options, retryWithFallback, retries - 1);
        }
        
        const text = await response.text();
        const error = new Error(text || `HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      
      return await response.blob();
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle timeout
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'TIMEOUT_ERROR';
      timeoutError.status = 408;
      throw timeoutError;
    }
    
    // Retry on network errors
    if (isRetryableError(error, null) && retries > 0) {
      const delay = RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
      await sleep(delay);
      return apiCall(endpoint, options, retryWithFallback, retries - 1);
    }
    // Se è un errore di rete e retryWithFallback è true, prova con Next.js API
    if (retryWithFallback && 
        (error.name === 'TypeError' || 
         error.message.includes('fetch') || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('NetworkError'))) {
      
      // Reset cache per forzare nuovo controllo
      resetBackendStatusCache();
      
      // Prova con Next.js API (fallback)
      const fallbackUrl = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      // Log solo in sviluppo locale
      const isLocal = typeof window !== 'undefined' && 
                     (window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1');
      if (isLocal) {
        console.warn(`[apiClient] Backend Python non disponibile, uso fallback Next.js API: ${fallbackUrl}`);
      }
      
      try {
        const fallbackResponse = await fetch(fallbackUrl, config);
        
        const contentType = fallbackResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await fallbackResponse.json();
          
          if (!fallbackResponse.ok) {
            throw new Error(data.error || data.message || `HTTP ${fallbackResponse.status}`);
          }
          
          return data;
        } else {
          if (!fallbackResponse.ok) {
            const text = await fallbackResponse.text();
            throw new Error(text || `HTTP ${fallbackResponse.status}`);
          }
          
          return await fallbackResponse.blob();
        }
      } catch (fallbackError) {
        // Se anche il fallback fallisce, rilancia l'errore originale
        console.error('API call error (both backend and fallback failed):', error);
        throw new Error(`Errore di connessione: ${error.message}. Verifica che il backend sia disponibile o che le API Next.js siano configurate correttamente.`);
      }
    }
    
    console.error('API call error:', error);
    throw error;
  }
}

/**
 * Upload file to API
 */
export async function uploadFile(endpoint, file, additionalFields = {}) {
  const formData = new FormData();
  
  // Backend Python per jpg-to-pdf si aspetta 'images' invece di 'file'
  const fieldName = endpoint.includes('/jpg-to-pdf') || endpoint.includes('/image-to-pdf') 
    ? 'images' 
    : 'file';
  
  formData.append(fieldName, file);
  
  // Add additional fields
  Object.entries(additionalFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  
  // Log per debug (sempre attivo per vedere URL chiamati online)
  console.log(`[uploadFile] Chiamata a: ${endpoint}, campo: ${fieldName}, file: ${file?.name || 'unknown'}`);
  
  return apiCall(endpoint, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Convert blob to data URL
 */
export async function blobToDataUrl(blob, mimeType = 'image/png') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

