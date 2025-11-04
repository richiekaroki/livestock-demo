// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import AnimalList from "../components/animals/AnimalList";
import RegistrationForm from "../components/animals/RegistrationForm";
import StatisticsCards from "../components/dashboard/StatisticsCards";
import StatusIndicator from "../components/dashboard/StatusIndicator";
import FilterBar from "../components/filters/FilterBar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useLiveData } from "../hooks/useLiveData";
import { mockAPI } from "../services/mockApi";
import type { AnimalStats, Filters } from "../types";

export default function Dashboard() {
  const { data, loading, error, refetch } = useLiveData();
  const [stats, setStats] = useState<AnimalStats | null>(null);
  const [filters, setFilters] = useState<Filters>({
    type: "",
    health: "",
    county: "",
  });

  const filteredData = data.filter((animal) => {
    return (
      (filters.type === "" || animal.type === filters.type) &&
      (filters.health === "" || animal.health === filters.health) &&
      (filters.county === "" || animal.county === filters.county)
    );
  });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await mockAPI.getAnimalStatistics();
        if (response.success) setStats(response.data);
      } catch {
        console.error("Failed to load statistics");
      }
    };
    loadStats();
  }, [data]);

  if (loading && !data.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading livestock data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Indicator */}
        {error && (
          <div className="mb-6">
            <StatusIndicator error={error} />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Livestock Dashboard
          </h1>
          <p className="text-text-secondary">
            Manage and monitor your livestock inventory across{" "}
            {stats?.counties || 0} counties
          </p>
        </div>

        {/* Stats + Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Statistics - 2/3 width */}
          <div className="lg:col-span-2">
            {stats && <StatisticsCards stats={stats} />}
          </div>

          {/* Registration Form - 1/3 width */}
          <div className="lg:col-span-1">
            <RegistrationForm data={data} onAnimalAdded={refetch} />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            data={data}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="card">
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Livestock Overview
            </h2>
            <p className="text-text-secondary">
              Showing{" "}
              <span className="font-semibold text-accent">
                {filteredData.length}
              </span>{" "}
              animals out of{" "}
              <span className="font-semibold text-text-primary">
                {data.length}
              </span>{" "}
              total
              {filters.type && ` • Type: ${filters.type}`}
              {filters.health && ` • Health: ${filters.health}`}
              {filters.county && ` • County: ${filters.county}`}
            </p>
          </div>
        </div>

        {/* Animal List */}
        <AnimalList data={filteredData} />

        {/* Reset Filters */}
        {(filters.type || filters.health || filters.county) && (
          <div className="text-center mt-6">
            <button
              onClick={() => setFilters({ type: "", health: "", county: "" })}
              className="btn btn-secondary"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
