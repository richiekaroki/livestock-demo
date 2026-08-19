// src/components/FilterBar.tsx

import { memo } from "react";
import type { Filters } from "@wam-mfugo/shared";
import { KENYA_COUNTIES, LIVESTOCK_TYPES, HEALTH_STATUSES } from "@wam-mfugo/shared";

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
}

const FilterBar = memo(function FilterBar({
  filters,
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3">
      <div className="flex gap-2 flex-wrap flex-1">
        <select
          className="input-field w-auto min-w-[140px]"
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
          aria-label="Filter by animal type"
        >
          <option value="">All Types</option>
          {LIVESTOCK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className="input-field w-auto min-w-[140px]"
          value={filters.county}
          onChange={(e) => onFilterChange("county", e.target.value)}
          aria-label="Filter by county"
        >
          <option value="">All Counties</option>
          {KENYA_COUNTIES.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="input-field w-auto min-w-[160px]"
          value={filters.health}
          onChange={(e) => onFilterChange("health", e.target.value)}
          aria-label="Filter by health status"
        >
          <option value="">All Health Status</option>
          {HEALTH_STATUSES.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-ghost text-sm"
        onClick={() => {
          onFilterChange("type", "");
          onFilterChange("county", "");
          onFilterChange("health", "");
        }}
        aria-label="Reset all filters"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset Filters
      </button>
    </div>
  );
});

export default FilterBar;