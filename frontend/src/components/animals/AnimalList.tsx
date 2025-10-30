// src/components/animals/AnimalList.tsx

import type { Livestock } from "../../types";
import { healthBadgeClasses, typeBadgeClasses } from "../../utils/constants";

interface AnimalListProps {
  data: Livestock[];
}

export default function AnimalList({ data }: AnimalListProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <div className="text-gray-500 text-lg">No animals found matching your filters</div>
        <div className="text-gray-400 text-sm mt-2">Try adjusting your filter criteria</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Livestock Inventory</h3>
        <p className="text-sm text-gray-600 mt-1">
          {data.length} animal{data.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">County</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((animal) => (
              <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{animal.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{animal.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeBadgeClasses[animal.type]}`}>
                    {animal.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${healthBadgeClasses[animal.health]}`}>
                    {animal.health}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.county}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}