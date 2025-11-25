/**
 * Get API URL - returns full URL for API calls
 * Uses Python backend if configured, otherwise falls back to Next.js API routes
 */
export function getApiUrl(endpoint) {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Check if Python backend URL is configured
  const pythonApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_PYTHON_API_URL;
  
  if (pythonApiUrl) {
    // Use Python backend
    const baseUrl = pythonApiUrl.endsWith('/') ? pythonApiUrl.slice(0, -1) : pythonApiUrl;
    return `${baseUrl}${cleanEndpoint}`;
  }
  
  // Fallback to Next.js API routes (client-side only)
  if (typeof window !== 'undefined') {
    return cleanEndpoint;
  }
  
  // Server-side: use full URL
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${cleanEndpoint}`;
}

/**
 * Check if Python backend is available
 */
export async function checkPythonBackend(baseUrl = null) {
  const url = baseUrl || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_PYTHON_API_URL;
  if (!url) return false;
  
  try {
    const response = await fetch(`${url}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

