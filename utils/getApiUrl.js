/**
 * Get API URL - returns full URL for API calls
 * Uses Python backend if configured and available, otherwise falls back to Next.js API routes
 */

// Cache per lo stato del backend (evita controlli continui)
const backendStatusCache = {
  isAvailable: null,
  lastCheck: 0,
  checkInterval: 30000, // Controlla ogni 30 secondi
};

/**
 * Get Python backend URL from environment
 */
function getPythonBackendUrl() {
  if (typeof window !== 'undefined') {
    return (
      window.__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL ||
      window.__NEXT_DATA__?.env?.NEXT_PUBLIC_PYTHON_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_PYTHON_API_URL
    );
  }
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_PYTHON_API_URL;
}

/**
 * Check if Python backend is available (with caching)
 */
export async function checkPythonBackend(baseUrl = null, forceCheck = false) {
  const url = baseUrl || getPythonBackendUrl();
  if (!url || url === 'undefined' || url === '') {
    return false;
  }

  // Usa cache se disponibile e non è un controllo forzato
  const now = Date.now();
  if (!forceCheck && backendStatusCache.isAvailable !== null && 
      (now - backendStatusCache.lastCheck) < backendStatusCache.checkInterval) {
    return backendStatusCache.isAvailable;
  }

  try {
    const healthUrl = url.endsWith('/') ? `${url}health` : `${url}/health`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 secondi timeout

    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    const isAvailable = response.ok;

    // Aggiorna cache
    backendStatusCache.isAvailable = isAvailable;
    backendStatusCache.lastCheck = now;

    return isAvailable;
  } catch (error) {
    // Backend non disponibile
    backendStatusCache.isAvailable = false;
    backendStatusCache.lastCheck = now;
    return false;
  }
}

/**
 * Get API URL with automatic fallback
 * @param {string} endpoint - API endpoint (e.g., '/api/tools/upscale')
 * @param {boolean} forceBackend - Force use of Python backend (skip availability check)
 * @returns {Promise<string>} Full URL to use
 */
export async function getApiUrl(endpoint, forceBackend = false) {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Get Python backend URL
  const pythonApiUrl = getPythonBackendUrl();

  // Se non c'è backend configurato, usa sempre Next.js API
  if (!pythonApiUrl || pythonApiUrl === 'undefined' || pythonApiUrl === '') {
    if (typeof window !== 'undefined') {
      return cleanEndpoint;
    }
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${cleanEndpoint}`;
  }

  // Se forceBackend è true, usa direttamente il backend Python
  if (forceBackend) {
    const baseUrl = pythonApiUrl.endsWith('/') ? pythonApiUrl.slice(0, -1) : pythonApiUrl;
    return `${baseUrl}${cleanEndpoint}`;
  }

  // Controlla se il backend è disponibile (con cache)
  const isBackendAvailable = await checkPythonBackend(pythonApiUrl);

  if (isBackendAvailable) {
    // Usa backend Python
    const baseUrl = pythonApiUrl.endsWith('/') ? pythonApiUrl.slice(0, -1) : pythonApiUrl;
    return `${baseUrl}${cleanEndpoint}`;
  }

  // Fallback a Next.js API routes
  if (typeof window !== 'undefined') {
    return cleanEndpoint;
  }

  // Server-side: use full URL
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${cleanEndpoint}`;
}

/**
 * Synchronous version of getApiUrl (for cases where async is not possible)
 * Uses cached backend status or assumes backend is available if configured
 */
export function getApiUrlSync(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const pythonApiUrl = getPythonBackendUrl();

  if (!pythonApiUrl || pythonApiUrl === 'undefined' || pythonApiUrl === '') {
    if (typeof window !== 'undefined') {
      return cleanEndpoint;
    }
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${cleanEndpoint}`;
  }

  // Se abbiamo un cache che dice che il backend non è disponibile, usa Next.js
  if (backendStatusCache.isAvailable === false) {
    if (typeof window !== 'undefined') {
      return cleanEndpoint;
    }
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${cleanEndpoint}`;
  }

  // Altrimenti prova il backend Python (sarà gestito l'errore nella chiamata)
  const baseUrl = pythonApiUrl.endsWith('/') ? pythonApiUrl.slice(0, -1) : pythonApiUrl;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Reset backend status cache (useful for testing or after errors)
 */
export function resetBackendStatusCache() {
  backendStatusCache.isAvailable = null;
  backendStatusCache.lastCheck = 0;
}

