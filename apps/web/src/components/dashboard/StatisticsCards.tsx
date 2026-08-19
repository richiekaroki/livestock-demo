// src/components/dashboard/StatisticsCards.tsx
import { memo } from "react";
import type { AnimalStats } from "@wam-mfugo/shared";

interface StatisticsCardsProps {
  stats: AnimalStats;
}

const StatisticsCards = memo(function StatisticsCards({
  stats,
}: StatisticsCardsProps) {
  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Primary metric — total count */}
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold font-mono text-text-primary">
            {stats.totalAnimals.toLocaleString()}
          </span>
          <span className="text-sm text-text-secondary">total animals tracked</span>
        </div>

        {/* Secondary metrics — inline row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-success">
              {stats.healthyCount.toLocaleString()}
            </span>
            <span className="text-sm text-text-secondary">healthy</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-error">
              {stats.sickCount.toLocaleString()}
            </span>
            <span className="text-sm text-text-secondary">sick</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-warning">
              {stats.underTreatmentCount.toLocaleString()}
            </span>
            <span className="text-sm text-text-secondary">treatment</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-info">
              {stats.recoveredCount.toLocaleString()}
            </span>
            <span className="text-sm text-text-secondary">recovered</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-text-primary">
              {stats.counties.toLocaleString()}
            </span>
            <span className="text-sm text-text-secondary">counties</span>
          </div>
        </div>
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
