// src/components/dashboard/StatusIndicator.tsx
interface StatusIndicatorProps {
  error: string | null;
}

export default function StatusIndicator({ error }: StatusIndicatorProps) {
  if (!error) return null;

  return (
    <div className="bg-error-bg border border-error-border text-error-text px-4 py-3 rounded-lg">
      <div className="flex items-center">
        <span className="text-lg mr-2">⚠️</span>
        <div>
          <strong className="font-semibold">Connection Issue: </strong>
          <span>{error}</span>
        </div>
      </div>
    </div>
  );
}
