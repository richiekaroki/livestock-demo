// src/components/dashboard/StatisticsCards.tsx
import { memo } from "react";
import type { AnimalStats } from "@wam-mfugo/shared";

interface StatisticsCardsProps {
  stats: AnimalStats;
}

const HEALTH_SEGMENTS = [
  { key: "healthy", color: "bg-success", label: "Healthy" },
  { key: "sick", color: "bg-error", label: "Sick" },
  { key: "underTreatment", color: "bg-warning", label: "Treatment" },
  { key: "recovered", color: "bg-info", label: "Recovered" },
] as const;

const STATS_GRID = [
  { key: "healthyCount", color: "text-success", label: "Healthy" },
  { key: "sickCount", color: "text-error", label: "Sick" },
  { key: "underTreatmentCount", color: "text-warning", label: "Treatment" },
  { key: "recoveredCount", color: "text-info", label: "Recovered" },
  { key: "counties", color: "text-text-primary", label: "Counties" },
] as const;

function getSegmentWidth(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function getHealthCount(stats: AnimalStats, key: string): number {
  switch (key) {
    case "healthyCount": return stats.healthyCount;
    case "sickCount": return stats.sickCount;
    case "underTreatmentCount": return stats.underTreatmentCount;
    case "recoveredCount": return stats.recoveredCount;
    case "counties": return stats.counties;
    default: return 0;
  }
}

const StatisticsCards = memo(function StatisticsCards({
  stats,
}: StatisticsCardsProps) {
  const total = stats.totalAnimals;
  const healthyPct = getSegmentWidth(stats.healthyCount, total);
  const sickPct = getSegmentWidth(stats.sickCount, total);
  const treatmentPct = getSegmentWidth(stats.underTreatmentCount, total);
  const recoveredPct = getSegmentWidth(stats.recoveredCount, total);

  return (
    <div className="card">
      {/* Hero total */}
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-3xl sm:text-4xl font-bold font-mono text-text-primary tracking-tight">
          {total.toLocaleString()}
        </span>
        <span className="text-sm text-text-secondary">total animals</span>
      </div>

      {/* Health status chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {HEALTH_SEGMENTS.map((seg) => {
          const count =
            seg.key === "healthy" ? stats.healthyCount :
            seg.key === "sick" ? stats.sickCount :
            seg.key === "underTreatment" ? stats.underTreatmentCount :
            stats.recoveredCount;
          return (
            <span
              key={seg.key}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${seg.color}/10 ${seg.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${seg.color}`} />
              {count.toLocaleString()} {seg.label}
            </span>
          );
        })}
      </div>

      {/* Health distribution bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex h-2 rounded-full overflow-hidden bg-bg-secondary">
            {healthyPct > 0 && (
              <div
                className="bg-success transition-all duration-500"
                style={{ width: `${healthyPct}%` }}
                title={`Healthy: ${stats.healthyCount}`}
              />
            )}
            {treatmentPct > 0 && (
              <div
                className="bg-warning transition-all duration-500"
                style={{ width: `${treatmentPct}%` }}
                title={`Under Treatment: ${stats.underTreatmentCount}`}
              />
            )}
            {recoveredPct > 0 && (
              <div
                className="bg-info transition-all duration-500"
                style={{ width: `${recoveredPct}%` }}
                title={`Recovered: ${stats.recoveredCount}`}
              />
            )}
            {sickPct > 0 && (
              <div
                className="bg-error transition-all duration-500"
                style={{ width: `${sickPct}%` }}
                title={`Sick: ${stats.sickCount}`}
              />
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-5 gap-3">
        {STATS_GRID.map((item) => (
          <div key={item.key} className="text-center">
            <div className={`text-lg sm:text-xl font-bold font-mono ${item.color}`}>
              {getHealthCount(stats, item.key).toLocaleString()}
            </div>
            <div className="text-xs text-text-tertiary">{item.label}</div>
          </div>
        ))}
      </div>

      {stats.lastUpdated && (
        <div className="text-xs text-text-tertiary mt-3 pt-3 border-t border-border font-mono">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
});

export default StatisticsCards;
