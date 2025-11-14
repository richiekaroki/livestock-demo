// src/components/map/MapLegend.tsx

/**
 * Map Legend Component
 *
 * Displays color-coded legend for map markers
 * Helps users understand health status visualization
 */
export default function MapLegend() {
  const legendItems = [
    { label: "Healthy", color: "#22c55e", icon: "✓" },
    { label: "Sick", color: "#ef4444", icon: "✕" },
    { label: "Under Treatment", color: "#eab308", icon: "⚕" },
    { label: "Recovered", color: "#3b82f6", icon: "↻" },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-lg font-bold text-text-primary mb-3">Map Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {legendItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 p-2 bg-bg-secondary rounded-lg border border-border"
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs"
              style={{ backgroundColor: item.color }}
            >
              <span className="text-white font-bold">{item.icon}</span>
            </div>
            <span className="text-sm font-medium text-text-primary">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-start gap-2 text-xs text-text-tertiary">
          <svg
            className="h-4 w-4 flex-shrink-0 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p>
            Click on markers to view detailed animal information. Markers close
            together are clustered and will expand when you zoom in or click
            them.
          </p>
        </div>
      </div>
    </div>
  );
}
