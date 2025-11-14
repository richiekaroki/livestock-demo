// src/components/dashboard/StatisticsCards.tsx
import type { AnimalStats } from "../../types";

interface StatisticsCardsProps {
  stats: AnimalStats;
}

export default function StatisticsCards({ stats }: StatisticsCardsProps) {
  const statItems = [
    {
      label: "Total Animals",
      value: stats.totalAnimals,
      color: "text-text-primary",
      bg: "bg-bg-secondary",
    },
    {
      label: "Healthy",
      value: stats.healthyCount,
      color: "text-success",
      bg: "bg-success-bg",
    },
    {
      label: "Sick",
      value: stats.sickCount,
      color: "text-error",
      bg: "bg-error-bg",
    },
    {
      label: "Under Treatment",
      value: stats.underTreatmentCount,
      color: "text-warning",
      bg: "bg-warning-bg",
    },
    {
      label: "Recovered",
      value: stats.recoveredCount,
      color: "text-info",
      bg: "bg-info-bg",
    },
    {
      label: "Counties",
      value: stats.counties,
      color: "text-text-primary",
      bg: "bg-bg-secondary",
    },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Livestock Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={`text-center p-4 rounded-lg border border-border ${item.bg}`}
          >
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </div>
            <div className="text-sm text-text-secondary mt-1">{item.label}</div>
          </div>
        ))}
      </div>
      {stats.lastUpdated && (
        <div className="text-xs text-text-tertiary mt-4 text-center">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}
