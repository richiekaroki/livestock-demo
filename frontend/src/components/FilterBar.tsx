// src/components/FilterBar.tsx

import type { Livestock } from "../data/livestockData";

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
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <select
        value={filters.type}
        onChange={(e) => onFilterChange("type", e.target.value)}
        className="p-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Types</option>
        {unique("type").map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={filters.health}
        onChange={(e) => onFilterChange("health", e.target.value)}
        className="p-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Health</option>
        {unique("health").map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <select
        value={filters.county}
        onChange={(e) => onFilterChange("county", e.target.value)}
        className="p-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Counties</option>
        {unique("county").map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
