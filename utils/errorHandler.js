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
 * Get enhanced error resolution suggestions
 */
export function getErrorResolution(error) {
  // Check if error has resolution information from API
  if (error?.resolution) {
    return {
      solution: error.resolution.solution || null,
      detailedSolution: error.resolution.detailedSolution || [],
      suggestedActions: error.resolution.suggestedActions || [],
      canRetry: error.resolution.canRetry || false,
      autoFixed: error.resolution.autoFixResult?.fixed || false,
      recoverySteps: error.resolution.recoverySteps || [],
    };
  }

  // Generate basic resolution based on error code
  const resolution = {
    solution: null,
    detailedSolution: [],
    suggestedActions: [],
    canRetry: false,
    autoFixed: false,
    recoverySteps: [],
  };

  // Map common error codes to solutions
  if (error?.code) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        resolution.solution = 'Errore di connessione. Controlla la tua connessione internet';
        resolution.detailedSolution = [
          'Verifica che la connessione internet sia attiva',
          'Controlla che il server sia raggiungibile',
          'Riprova l\'operazione tra qualche istante'
        ];
        resolution.canRetry = true;
        resolution.suggestedActions.push({
          type: 'retry',
          action: 'retry_operation',
          description: 'Riprova l\'operazione',
        });
        break;
      case 'TIMEOUT_ERROR':
        resolution.solution = 'Timeout: l\'operazione ha richiesto troppo tempo';
        resolution.detailedSolution = [
          'L\'operazione sta richiedendo più tempo del previsto',
          'Riprova l\'operazione',
          'Se il problema persiste, contatta il supporto'
        ];
        resolution.canRetry = true;
        resolution.suggestedActions.push({
          type: 'retry',
          action: 'retry_with_increased_timeout',
          description: 'Riprova con timeout aumentato',
        });
        break;
      case 'RATE_LIMIT_EXCEEDED':
        resolution.solution = 'Limite di richieste superato. Attendi prima di riprovare';
        resolution.detailedSolution = [
          'Hai superato il limite di richieste consentite',
          'Attendi alcuni minuti prima di riprovare',
          'Riduci la frequenza delle richieste'
        ];
        resolution.canRetry = true;
        const retryAfter = error.details?.retryAfter || 60;
        resolution.suggestedActions.push({
          type: 'wait',
          action: 'wait_and_retry',
          description: `Attendi ${retryAfter} secondi prima di riprovare`,
          waitTime: retryAfter * 1000,
        });
        break;
    }
  }

  return resolution;
}

/**
 * Handle API error response with enhanced resolution information
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

  // Extract resolution information if available
  const resolution = errorData.resolution || null;
  let resolutionMessage = null;
  let canRetry = false;
  let suggestedActions = [];

  if (resolution) {
    // Build resolution message with detailed solutions
    if (resolution.detailedSolution && resolution.detailedSolution.length > 0) {
      resolutionMessage = resolution.detailedSolution.join('\n• ');
    } else if (resolution.solution) {
      resolutionMessage = resolution.solution;
    }

    canRetry = resolution.canRetry || false;
    suggestedActions = resolution.suggestedActions || [];

    // If auto-fix was attempted and succeeded, show success message
    if (resolution.autoFixAttempted && resolution.autoFixResult?.fixed) {
      showToast(
        'Errore risolto automaticamente. Riprova l\'operazione.',
        'success',
        4000
      );
      return {
        message: errorMessage,
        code: errorCode,
        status: response.status,
        details: errorData.details,
        resolution: resolution,
        canRetry: true,
        original: errorData,
      };
    }
  }

  // Determine error type based on status code and resolution
  let errorType = 'error';
  if (response.status >= 400 && response.status < 500) {
    // Client errors - show as warning
    errorType = response.status === 401 || response.status === 403 ? 'error' : 'warning';
  }

  // If error can be retried, show info message
  if (canRetry) {
    errorType = 'info';
  }

  // Build details message with resolution information
  let detailsMessage = errorData.details ? (typeof errorData.details === 'string' 
    ? errorData.details 
    : JSON.stringify(errorData.details, null, 2)) : null;

  if (resolutionMessage) {
    if (detailsMessage) {
      detailsMessage = `Risoluzione:\n${resolutionMessage}\n\nDettagli:\n${detailsMessage}`;
    } else {
      detailsMessage = `Risoluzione:\n${resolutionMessage}`;
    }
  }

  // Show toast notification with enhanced information
  showToast(
    errorMessage,
    errorType,
    canRetry ? 8000 : 6000, // Show longer if can retry
    {
      details: detailsMessage,
      technical: errorDetails,
      canRetry: canRetry,
      suggestedActions: suggestedActions,
      resolution: resolution,
    }
  );

  // Return error object for further handling
  return {
    message: errorMessage,
    code: errorCode,
    status: response.status,
    details: errorData.details,
    resolution: resolution,
    canRetry: canRetry,
    suggestedActions: suggestedActions,
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
 * Retry operation with exponential backoff and enhanced error resolution
 */
export async function retryOperation(operation, maxRetries = 3, delay = 1000, context = {}) {
  let lastError;
  let lastErrorResolution = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Extract resolution information from error if available
      if (error.resolution) {
        lastErrorResolution = error.resolution;
      } else if (error.canRetry !== undefined) {
        lastErrorResolution = {
          canRetry: error.canRetry,
          suggestedActions: error.suggestedActions || [],
        };
      }
      
      // Don't retry on certain errors
      if (error.code === 'VALIDATION_ERROR' || 
          error.code === 'AUTHENTICATION_ERROR' ||
          error.code === 'AUTHORIZATION_ERROR' ||
          error.status === 400 ||
          error.status === 401 ||
          error.status === 403) {
        throw error;
      }
      
      // Check if error resolution suggests not to retry
      if (lastErrorResolution && !lastErrorResolution.canRetry && attempt > 1) {
        throw error;
      }
      
      // If last attempt, throw error
      if (attempt === maxRetries) {
        break;
      }
      
      // Determine wait time - use suggested wait time if available
      let waitTime = delay * Math.pow(2, attempt - 1);
      const waitAction = lastErrorResolution?.suggestedActions?.find(
        a => a.type === 'wait' && a.waitTime
      );
      if (waitAction) {
        waitTime = waitAction.waitTime;
      }
      
      // Wait before retrying (exponential backoff or suggested wait)
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Show retry notification with resolution info if available
      let retryMessage = `Tentativo ${attempt + 1} di ${maxRetries}...`;
      if (lastErrorResolution?.solution) {
        retryMessage = `${retryMessage}\n${lastErrorResolution.solution}`;
      }
      
      if (attempt < maxRetries) {
        showToast(
          retryMessage,
          'info',
          3000
        );
      }
    }
  }
  
  // If error has resolution info, include it in the thrown error
  if (lastErrorResolution && lastError) {
    lastError.resolution = lastErrorResolution;
  }
  
  throw lastError;
}

