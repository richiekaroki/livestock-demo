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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Livestock Map
        </h1>
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-gray-600 dark:text-gray-400">Showing: </span>
          <span className="font-bold text-gray-800 dark:text-white">
            {data.length} animals out of {allData.length} total
          </span>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        data={allData}
      />

      <LivestockMap data={data} />

      <MapLegend />
    </div>
  );
}
