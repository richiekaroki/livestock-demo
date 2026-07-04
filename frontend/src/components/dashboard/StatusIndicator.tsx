// src/components/dashboard/StatusIndicator.tsx
interface StatusIndicatorProps {
  error: string | null;
}

export default function StatusIndicator({ error }: StatusIndicatorProps) {
  if (!error) return null;

  return (
    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl">
      <div className="flex items-center">
        <svg className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <strong className="font-semibold">Connection Issue: </strong>
          <span>{error}</span>
        </div>
      </div>
    </div>
  );
}
