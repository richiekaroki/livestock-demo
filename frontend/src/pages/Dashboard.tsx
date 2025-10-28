// src/pages/Dashboard.tsx

import { useEffect, useState } from "react";
import { AddAnimalForm } from "../components/AddAnimalForm";
import FilterBar from "../components/FilterBar"; // Add this import
import { LivestockList } from "../components/LivestockList"; // Add this import
import { useLiveData } from "../hooks/useLiveData";
import { mockAPI } from "../services/mockApi";

// Remove props - Dashboard manages its own data
export default function Dashboard() {
  const { data, loading, error, refetch } = useLiveData();
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    type: "",
    health: "",
    county: "",
  });

  // Handle filter changes locally
  const handleFilterChange = (
    key: "type" | "health" | "county",
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filter data based on current filters
  const filteredData = data.filter((animal) => {
    return (
      (filters.type === "" || animal.type === filters.type) &&
      (filters.health === "" || animal.health === filters.health) &&
      (filters.county === "" || animal.county === filters.county)
    );
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await mockAPI.getAnimalStatistics();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        console.error("Failed to load statistics");
      }
    };

    loadStats();
  }, []);

  if (loading && !data.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading livestock data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Status Indicator */}
      <div
        className={`p-3 rounded-lg ${
          error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
        }`}
      >
        {error
          ? "⚠️ Offline Mode - Using cached data"
          : "✅ Connected to Livestock API"}
      </div>

      {/* Statistics */}
      {stats && (
        <div className="p-3 rounded-lg bg-blue-50 text-blue-800">
          <div className="font-medium">Animal Statistics</div>
          <pre className="text-sm mt-2">{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}

      {/* Add Animal Form */}
      <AddAnimalForm onAnimalAdded={refetch} />

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        data={data}
      />

      {/* Your existing dashboard content would go here */}
      {/* For example: */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Livestock Overview</h2>
        <p className="text-gray-600">
          Showing {filteredData.length} animals out of {data.length} total
        </p>
      </div>

      {/* Livestock List Table */}
      <LivestockList data={filteredData} />
    </div>
  );
}
