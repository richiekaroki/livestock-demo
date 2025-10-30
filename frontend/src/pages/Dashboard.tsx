import { useEffect, useState } from "react";
import AnimalList from "../components/animals/AnimalList";
import RegistrationForm from "../components/animals/RegistrationForm";
import StatisticsCards from "../components/dashboard/StatisticsCards";
import StatusIndicator from "../components/dashboard/StatusIndicator";
import FilterBar from "../components/filters/FilterBar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { mockAPI } from "../services/mockApi";
import type { AnimalStats, Filters, Livestock } from "../types";

interface DashboardProps {
  data: Livestock[];
  filteredData: Livestock[];
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export default function Dashboard({
  data,
  filteredData,
  filters,
  onFilterChange,
  loading,
  error,
  refetch,
}: DashboardProps) {
  const [stats, setStats] = useState<AnimalStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await mockAPI.getAnimalStatistics();
        if (response.success) {
          setStats(response.data);
        }
      } catch {
        console.error("Failed to load statistics");
      }
    };

    loadStats();
  }, []);

  if (loading && !data.length) {
    return <LoadingSpinner text="Loading livestock data..." />;
  }

  return (
    <div className="space-y-6">
      <StatusIndicator error={error} />

      {stats && <StatisticsCards stats={stats} />}

      <RegistrationForm onAnimalAdded={refetch} />

      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        data={data}
      />

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Livestock Overview
        </h2>
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-semibold text-blue-600">
            {filteredData.length}
          </span>{" "}
          animals out of{" "}
          <span className="font-semibold text-gray-800">{data.length}</span>{" "}
          total
        </p>
      </div>

      <AnimalList data={filteredData} />
    </div>
  );
}
