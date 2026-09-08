import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { classifyError } from '../../utils/errorRecovery';

interface ErrorRecoveryProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorRecovery({ error, onRetry, onDismiss, className = '' }: ErrorRecoveryProps) {
  const apiError = classifyError(error);
  const canRetry = apiError.isRetryable ?? false;

  const handleRetry = () => {
    onRetry?.();
  };

  const handleDismiss = () => {
    onDismiss?.();
  };

  return (
    <div className={`card border-error/30 bg-error/5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5 text-error" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {getErrorTitle(apiError)}
          </h3>
          <p className="text-sm text-text-secondary mb-3">
            {apiError.message}
          </p>
          
          <div className="flex items-center gap-2">
            {canRetry && onRetry && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-primary bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors min-h-[36px]"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={handleDismiss}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors min-h-[36px]"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function getErrorTitle(apiError: ReturnType<typeof classifyError>): string {
  if (apiError.isNetworkError) {
    return 'Connection Error';
  }
  if (apiError.isServerError) {
    return 'Server Error';
  }
  if (apiError.isClientError) {
    return 'Request Error';
  }
  return 'Error';
}