// src/components/FilterBar.tsx

// FilterBar.tsx
import type { Filters, Livestock } from "../../types";

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  data: Livestock[];
}

export default function FilterBar({
  filters,
  onFilterChange,
  data,
}: FilterBarProps) {
  return (
    <div className="card p-4 flex flex-col md:flex-row items-center gap-4">
      <div className="flex gap-2 flex-wrap">
        <select
          className="input-field"
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
        >
          <option value="">All Types</option>
          {[...new Set(data.map((d) => d.type))].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className="input-field"
          value={filters.county}
          onChange={(e) => onFilterChange("county", e.target.value)}
        >
          <option value="">All Counties</option>
          {[...new Set(data.map((d) => d.county))].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="input-field"
          value={filters.health}
          onChange={(e) => onFilterChange("health", e.target.value)}
        >
          <option value="">All Health Status</option>
          {[...new Set(data.map((d) => d.health))].map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-gray mt-2 md:mt-0"
        onClick={() => {
          onFilterChange("type", "");
          onFilterChange("county", "");
          onFilterChange("health", "");
        }}
      >
        Reset Filters
      </button>
    </div>
  );
}
