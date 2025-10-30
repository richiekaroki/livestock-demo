// src/components/dashboard/StatisticsCards.tsx

import type { AnimalStats } from "../../types";

interface StatisticsCardsProps {
  stats: AnimalStats;
}

export default function StatisticsCards({ stats }: StatisticsCardsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">
        Livestock Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">{stats.totalAnimals}</div>
          <div className="text-sm text-blue-800 font-medium">Total Animals</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="text-2xl font-bold text-green-600">{stats.healthyCount}</div>
          <div className="text-sm text-green-800 font-medium">Healthy</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
          <div className="text-2xl font-bold text-red-600">{stats.sickCount}</div>
          <div className="text-sm text-red-800 font-medium">Sick</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="text-2xl font-bold text-purple-600">{stats.counties}</div>
          <div className="text-sm text-purple-800 font-medium">Counties</div>
        </div>
      </div>
      {(stats.underTreatmentCount > 0 || stats.recoveredCount > 0) && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="text-xl font-bold text-yellow-600">{stats.underTreatmentCount}</div>
            <div className="text-sm text-yellow-800 font-medium">Under Treatment</div>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="text-xl font-bold text-indigo-600">{stats.recoveredCount}</div>
            <div className="text-sm text-indigo-800 font-medium">Recovered</div>
          </div>
        </div>
      )}
    </div>
  );
}