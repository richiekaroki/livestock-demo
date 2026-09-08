// src/components/dashboard/StatusIndicator.tsx
import { AlertCircle, RefreshCw } from 'lucide-react';
import { classifyError } from '../../utils/errorRecovery';

interface StatusIndicatorProps {
  error: string | null;
  onRetry?: () => void;
}

export default function StatusIndicator({ error, onRetry }: StatusIndicatorProps) {
  if (!error) return null;

  const apiError = classifyError(new Error(error));
  const canRetry = apiError.isRetryable ?? true;

  return (
    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <div>
            <strong className="font-semibold">Connection issue: </strong>
            <span>{apiError.message}</span>
          </div>
        </div>
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-error bg-error/10 hover:bg-error/20 rounded-lg transition-colors min-h-[36px]"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
