/**
 * API Client - Centralized API calls with automatic fallback
 * Uses Python backend if available, otherwise falls back to Next.js API routes
 */
import { getApiUrl, getApiUrlSync, resetBackendStatusCache } from './getApiUrl';

/**
 * Make API call with automatic fallback
 * @param {string} endpoint - API endpoint (e.g., '/api/tools/upscale')
 * @param {object} options - Fetch options
 * @param {boolean} retryWithFallback - If true, retry with Next.js API on error
 */
export async function apiCall(endpoint, options = {}, retryWithFallback = true) {
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
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }
      
      return data;
    } else {
      // For blob responses (images, files)
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
      
      return await response.blob();
    }
  } catch (error) {
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
      console.warn(`Backend Python non disponibile, uso fallback Next.js API: ${fallbackUrl}`);
      
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
  formData.append('file', file);
  
  // Add additional fields
  Object.entries(additionalFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  
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

