// src/components/map/MapLegend.tsx

import { healthColors } from "../../utils/constants";

export default function MapLegend() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
        Map Legend
      </h3>
      <div className="flex flex-wrap gap-4">
        {Object.entries(healthColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-white shadow"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {status}
            </span>
          </div>    
        ))}
      </div>
    </div>
  );
}
