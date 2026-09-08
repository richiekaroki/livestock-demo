/**
 * Error recovery utilities with retry logic and user-friendly error messages
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  isNetworkError?: boolean;
  isServerError?: boolean;
  isClientError?: boolean;
  isRetryable?: boolean;
}

/**
 * Classify an error for better error handling
 */
export function classifyError(error: unknown): ApiError {
  const apiError: ApiError = {
    message: 'An unexpected error occurred',
  };

  if (error instanceof Error) {
    apiError.message = error.message;
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    apiError.isNetworkError = true;
    apiError.isRetryable = true;
    apiError.message = 'Network connection failed. Please check your internet connection.';
    return apiError;
  }

  // HTTP status codes
  if (error instanceof Response) {
    apiError.statusCode = error.status;
    
    if (error.status >= 500) {
      apiError.isServerError = true;
      apiError.isRetryable = true;
      apiError.message = 'Server error. Please try again later.';
    } else if (error.status >= 400) {
      apiError.isClientError = true;
      apiError.isRetryable = false;
      
      switch (error.status) {
        case 400:
          apiError.message = 'Invalid request. Please check your input.';
          break;
        case 401:
          apiError.message = 'Authentication required. Please log in.';
          break;
        case 403:
          apiError.message = 'You do not have permission to perform this action.';
          break;
        case 404:
          apiError.message = 'The requested resource was not found.';
          break;
        case 409:
          apiError.message = 'This resource already exists or conflicts with existing data.';
          break;
        case 429:
          apiError.isRetryable = true;
          apiError.message = 'Too many requests. Please wait and try again.';
          break;
        default:
          apiError.message = 'Request failed. Please try again.';
      }
    }
  }

  return apiError;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      const apiError = classifyError(error);
      
      // Don't retry if the error is not retryable
      if (!apiError.isRetryable && attempt > 1) {
        throw lastError;
      }

      // If this is the last attempt, throw the error
      if (attempt >= maxAttempts) {
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Call retry callback
      if (onRetry) {
        onRetry(attempt, lastError);
      }
    }
  }

  throw lastError!;
}

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const apiError = classifyError(error);
  return apiError.message;
}

/**
 * Check if an error is retryable
 */
export function isRetryable(error: unknown): boolean {
  const apiError = classifyError(error);
  return apiError.isRetryable ?? false;
}

/**
 * Create an error recovery action
 */
export function createRecoveryAction(
  error: unknown,
  onRetry: () => void,
  onDismiss: () => void
): {
  message: string;
  canRetry: boolean;
  retry: () => void;
  dismiss: () => void;
} {
  const apiError = classifyError(error);
  
  return {
    message: apiError.message,
    canRetry: apiError.isRetryable ?? false,
    retry: onRetry,
    dismiss: onDismiss,
  };
}