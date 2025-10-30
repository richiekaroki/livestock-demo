// src/components/FilterBar.tsx

import type { Livestock } from "../../data/livestockData";

interface Props {
  filters: {
    type: string;
    health: string;
    county: string;
  };
  onFilterChange: (key: keyof Props["filters"], value: string) => void;
  data: Livestock[];
}

export default function FilterBar({ filters, onFilterChange, data }: Props) {
  const unique = (key: keyof Livestock) => [
    ...new Set(data.map((d) => d[key] as string)),
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Filter Animals
      </h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Animal Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange("type", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="">All Types</option>
            {unique("type").map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Health Status
          </label>
          <select
            value={filters.health}
            onChange={(e) => onFilterChange("health", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="">All Health Status</option>
            {unique("health").map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            County
          </label>
          <select
            value={filters.county}
            onChange={(e) => onFilterChange("county", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="">All Counties</option>
            {unique("county").map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
