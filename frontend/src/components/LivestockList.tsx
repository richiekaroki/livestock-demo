// src/components/LivestockList.tsx

import type { Livestock } from "../data/livestockData";

interface LivestockListProps {
  data: Livestock[];
}

export function LivestockList({ data }: LivestockListProps) {
  // Removed unused healthCounts variable

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          Livestock Inventory
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {data.length} animals found
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Health
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                County
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((animal) => (
              <tr
                key={animal.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {animal.id}
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">
                  {animal.name}
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-800">
                  {animal.type}
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap">
                  <span
                    className={`health-badge ${
                      animal.health === "Healthy"
                        ? "health-badge--healthy"
                        : animal.health === "Sick"
                        ? "health-badge--sick"
                        : animal.health === "Under Treatment"
                        ? "health-badge--recovering"
                        : "health-badge--recovered"
                    }`}
                  >
                    {animal.health}
                  </span>
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-800">
                  {animal.county}
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-800">
                  {animal.owner}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
