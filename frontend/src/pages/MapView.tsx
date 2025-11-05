// src/pages/MapView.tsx
import FilterBar from "../components/filters/FilterBar";
import LivestockMap from "../components/map/LivestockMap";
import MapLegend from "../components/map/MapLegend";
import type { Filters, Livestock } from "../types";

interface MapViewProps {
  data: Livestock[];
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  allData: Livestock[];
}

export default function MapView({
  data,
  filters,
  onFilterChange,
  allData,
}: MapViewProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Livestock Map
          </h1>
          <p className="text-text-secondary mt-1">
            Visualize livestock distribution and health status across Kenya
          </p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">
              Map Overview
            </h2>
            <p className="text-text-secondary">
              Showing{" "}
              <span className="font-semibold text-accent">{data.length}</span>{" "}
              animals out of{" "}
              <span className="font-semibold text-text-primary">
                {allData.length}
              </span>{" "}
              total
              {filters.type && ` • Type: ${filters.type}`}
              {filters.health && ` • Health: ${filters.health}`}
              {filters.county && ` • County: ${filters.county}`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <FilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          data={allData}
        />
      </div>

      {/* Map */}
      <div className="card p-0 overflow-hidden">
        <LivestockMap data={data} />
      </div>

      {/* Legend */}
      <MapLegend />
    </div>
  );
}
