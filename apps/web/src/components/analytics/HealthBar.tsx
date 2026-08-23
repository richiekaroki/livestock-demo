import { memo, useMemo } from "react";
import type { AnimalStats } from "@wam-mfugo/shared";

interface HealthBarProps {
  stats: AnimalStats;
}

const HealthBar = memo(function HealthBar({ stats }: HealthBarProps) {
  const segments = useMemo(() => {
    const total = stats.totalAnimals || 1;
    return [
      { label: "Healthy", count: stats.healthyCount, color: "var(--color-success)", pct: (stats.healthyCount / total) * 100 },
      { label: "Sick", count: stats.sickCount, color: "var(--color-error)", pct: (stats.sickCount / total) * 100 },
      { label: "Treatment", count: stats.underTreatmentCount, color: "var(--color-warning)", pct: (stats.underTreatmentCount / total) * 100 },
      { label: "Recovered", count: stats.recoveredCount, color: "var(--color-info)", pct: (stats.recoveredCount / total) * 100 },
    ].filter((s) => s.count > 0);
  }, [stats]);

  if (stats.totalAnimals === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-bg-secondary">
        {segments.map((seg) => (
          <div
            key={seg.label}
            style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
            className="transition-all duration-300 first:rounded-l-full last:rounded-r-full"
            title={`${seg.label}: ${seg.count}`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-text-secondary">{seg.label}</span>
            <span className="font-mono font-medium text-text-primary">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default HealthBar;
