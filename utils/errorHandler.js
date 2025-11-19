/**
 * Frontend Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 */

import { showToast } from '../components/Toast';

/**
 * Error code to user-friendly message mapping
 */
const ERROR_MESSAGES = {
  // Validation errors
  VALIDATION_ERROR: 'I dati inseriti non sono validi',
  INVALID_FILE_TYPE: 'Tipo di file non supportato',
  FILE_TOO_LARGE: 'Il file è troppo grande',
  
  // Authentication errors
  AUTHENTICATION_ERROR: 'Autenticazione richiesta',
  AUTHORIZATION_ERROR: 'Non hai i permessi necessari',
  
  // Resource errors
  NOT_FOUND: 'Risorsa non trovata',
  CONFLICT: 'Conflitto: la risorsa esiste già',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Troppe richieste. Riprova più tardi',
  
  // System errors
  DATABASE_ERROR: 'Errore del database. Riprova più tardi',
  FILE_SYSTEM_ERROR: 'Errore nel sistema di file',
  NETWORK_ERROR: 'Errore di connessione. Controlla la tua connessione internet',
  TIMEOUT_ERROR: 'Timeout: l\'operazione ha richiesto troppo tempo',
  PROCESSING_ERROR: 'Errore durante l\'elaborazione',
  INTERNAL_ERROR: 'Errore interno del server. Riprova più tardi',
  
  // Method errors
  METHOD_NOT_ALLOWED: 'Metodo non consentito',
};

/**
 * Get user-friendly error message from error response
 */
export function getErrorMessage(error, defaultMessage = 'Si è verificato un errore') {
  // If error is already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If error has a message property
  if (error?.message) {
    return error.message;
  }

  // If error has a code, try to map it
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // If error has an error property (from API response)
  if (error?.error) {
    return error.error;
  }

  return defaultMessage;
}

/**
 * Get error details for technical information
 */
export function getErrorDetails(error) {
  const details = [];

  if (error?.details) {
    if (typeof error.details === 'object') {
      details.push(JSON.stringify(error.details, null, 2));
    } else {
      details.push(String(error.details));
    }
  }

  if (error?.stack && process.env.NODE_ENV === 'development') {
    details.push(error.stack);
  }

  return details.length > 0 ? details.join('\n\n') : null;
}

/**
 * Handle API error response
 */
export async function handleApiErrorResponse(response) {
  let errorData;
  
  try {
    errorData = await response.json();
  } catch (e) {
    // If response is not JSON, create a generic error
    errorData = {
      error: `Errore ${response.status}: ${response.statusText}`,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Extract error information
  const errorMessage = getErrorMessage(errorData);
  const errorCode = errorData.code || 'UNKNOWN_ERROR';
  const errorDetails = getErrorDetails(errorData);

  // Determine error type based on status code
  let errorType = 'error';
  if (response.status >= 400 && response.status < 500) {
    // Client errors - show as warning
    errorType = response.status === 401 || response.status === 403 ? 'error' : 'warning';
  }

  // Show toast notification
  showToast(
    errorMessage,
    errorType,
    6000, // Show for 6 seconds
    {
      details: errorData.details ? (typeof errorData.details === 'string' 
        ? errorData.details 
        : JSON.stringify(errorData.details, null, 2)) : null,
      technical: errorDetails,
    }
  );

  // Return error object for further handling
  return {
    message: errorMessage,
    code: errorCode,
    status: response.status,
    details: errorData.details,
    original: errorData,
  };
}

/**
 * Wrapper for fetch with improved error handling
 */
export async function fetchWithErrorHandling(url, options = {}) {
  try {
    // Don't set Content-Type for FormData - browser will set it with boundary
    const isFormData = options.body instanceof FormData;
    const headers = isFormData
      ? { ...options.headers }
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await handleApiErrorResponse(response);
      throw error;
    }

    return await response.json();
  } catch (error) {
    // If it's already our formatted error, rethrow it
    if (error.message && error.code) {
      throw error;
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = {
        message: 'Errore di connessione. Controlla la tua connessione internet',
        code: 'NETWORK_ERROR',
        status: 0,
        original: error,
      };
      
      showToast(
        networkError.message,
        'error',
        6000,
        {
          technical: process.env.NODE_ENV === 'development' ? error.stack : null,
        }
      );
      
      throw networkError;
    }

    // Handle abort/timeout errors
    if (error.name === 'AbortError') {
      const timeoutError = {
        message: 'Timeout: l\'operazione ha richiesto troppo tempo',
        code: 'TIMEOUT_ERROR',
        status: 408,
        original: error,
      };
      
      showToast(timeoutError.message, 'error', 6000);
      throw timeoutError;
    }

    // Unknown error
    const unknownError = {
      message: error.message || 'Si è verificato un errore sconosciuto',
      code: 'UNKNOWN_ERROR',
      status: 500,
      original: error,
    };
    
    showToast(
      unknownError.message,
      'error',
      6000,
      {
        technical: process.env.NODE_ENV === 'development' ? error.stack : null,
      }
    );
    
    throw unknownError;
  }
}

/**
 * Handle error in async operations (for use in try-catch blocks)
 */
export function handleError(error, customMessage = null) {
  const errorMessage = customMessage || getErrorMessage(error);
  
  showToast(
    errorMessage,
    'error',
    6000,
    {
      details: error?.details ? (typeof error.details === 'string' 
        ? error.details 
        : JSON.stringify(error.details, null, 2)) : null,
      technical: process.env.NODE_ENV === 'development' && error?.stack 
        ? error.stack 
        : null,
    }
  );

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error handled:', error);
  }

  return {
    message: errorMessage,
    code: error?.code || 'UNKNOWN_ERROR',
    original: error,
  };
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.code === 'VALIDATION_ERROR' || 
          error.code === 'AUTHENTICATION_ERROR' ||
          error.code === 'AUTHORIZATION_ERROR' ||
          error.status === 400 ||
          error.status === 401 ||
          error.status === 403) {
        throw error;
      }
      
      // If last attempt, throw error
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Show retry notification
      if (attempt < maxRetries) {
        showToast(
          `Tentativo ${attempt + 1} di ${maxRetries}...`,
          'info',
          2000
        );
      }
    }
  }
  
  throw lastError;
}

