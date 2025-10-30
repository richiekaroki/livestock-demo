// src/components/dashboard/StatusIndicator.tsx

interface StatusIndicatorProps {
  error: string | null;
}

export default function StatusIndicator({ error }: StatusIndicatorProps) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        error 
          ? "bg-red-50 border-red-200 text-red-800" 
          : "bg-green-50 border-green-200 text-green-800"
      }`}
    >
      <div className="flex items-center">
        <span className="text-lg mr-2">{error ? "⚠️" : "✅"}</span>
        <span className="font-medium">
          {error ? "Offline Mode - Using cached data" : "Connected to Livestock API"}
        </span>
      </div>
    </div>
  );
}