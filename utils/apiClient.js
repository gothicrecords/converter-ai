/**
 * API Client - Centralized API calls to Python backend
 */
const getApiBaseUrl = () => {
  // In browser, use environment variable or current origin
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_PYTHON_API_URL || 
           process.env.NEXT_PUBLIC_API_URL || 
           window.location.origin;
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_PYTHON_API_URL || 
         process.env.NEXT_PUBLIC_API_URL || 
         'http://localhost:8000';
};

/**
 * Make API call to Python backend
 */
export async function apiCall(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
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

