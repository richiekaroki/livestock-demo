// src/pages/MapView.tsx
import FilterBar from "../components/filters/FilterBar";
import LivestockMap from "../components/map/LivestockMap";
import { useLivestockStore } from "../store/livestockStore";
import type { Livestock } from "../types";

interface MapViewProps {
  data: Livestock[];
  allData: Livestock[];
}

export default function MapView({ data, allData }: MapViewProps) {
  const filters = useLivestockStore((s) => s.filters);
  const updateFilter = useLivestockStore((s) => s.updateFilter);

  const activeFilters = [
    filters.type && `Type: ${filters.type}`,
    filters.health && `Health: ${filters.health}`,
    filters.county && `County: ${filters.county}`,
  ]
    .filter(Boolean)
    .join(" \u2022 ");

  return (
    <div className="space-y-4">
      {/* Header with inline filter summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Livestock Map
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Showing{" "}
            <span className="font-semibold text-accent">{data.length}</span> of{" "}
            <span className="font-semibold text-text-primary">{allData.length}</span> animals
            {activeFilters && (
              <span className="text-text-tertiary"> {"\u2022"} {activeFilters}</span>
            )}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            data={allData}
          />
        </div>
      </div>

      {/* Map with empty state */}
      <div className="card p-0 overflow-hidden">
        <LivestockMap data={data} />
      </div>
    </div>
  );
}
