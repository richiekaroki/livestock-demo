// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import HealthAlerts from "../components/alerts/HealthAlerts";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";
import AnimalList from "../components/animals/AnimalList";
import RegistrationForm from "../components/animals/RegistrationForm";
import RefreshIndicator from "../components/dashboard/RefreshIndicator";
import StatisticsCards from "../components/dashboard/StatisticsCards";
import StatusIndicator from "../components/dashboard/StatusIndicator";
import ExportButton from "../components/export/ExportButton";
import FilterBar from "../components/filters/FilterBar";
import SearchBar from "../components/search/SearchBar";
import KALROSyncStatus from "../components/sync/KALROSyncStatus";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { mockAPI } from "../services/mockApi";
import { useLivestockStore } from "../store/livestockStore";
import type { AnimalStats, Livestock } from "../types";

interface DashboardProps {
  data: Livestock[];
  filteredData: Livestock[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export default function Dashboard({
  data,
  filteredData: initialFilteredData,
  loading,
  error,
  refetch,
}: DashboardProps) {
  const [stats, setStats] = useState<AnimalStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const filters = useLivestockStore((s) => s.filters);
  const updateFilter = useLivestockStore((s) => s.updateFilter);

  const autoRefresh = useAutoRefresh({
    enabled: true,
    interval: 30000,
    onRefresh: refetch,
  });

  const displayData = useMemo(() => {
    if (!searchQuery.trim()) return initialFilteredData;

    const query = searchQuery.toLowerCase();
    return initialFilteredData.filter(
      (animal) =>
        animal.name.toLowerCase().includes(query) ||
        animal.owner.toLowerCase().includes(query) ||
        animal.type.toLowerCase().includes(query) ||
        animal.county.toLowerCase().includes(query) ||
        animal.id.toString().includes(query)
    );
  }, [initialFilteredData, searchQuery]);

  const handleResetAll = () => {
    setSearchQuery("");
    updateFilter("type", "");
    updateFilter("county", "");
    updateFilter("health", "");
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
        {error && (
          <div className="mb-6">
            <StatusIndicator error={error} />
          </div>
        )}

        <div className="mb-6">
          <KALROSyncStatus />
        </div>

        <div className="mb-6 flex justify-end">
          <RefreshIndicator
            isRefreshing={autoRefresh.isRefreshing}
            lastRefresh={autoRefresh.lastRefresh}
            countdown={autoRefresh.countdown}
            isPaused={autoRefresh.isPaused}
            onRefresh={autoRefresh.triggerRefresh}
            onPause={autoRefresh.pause}
            onResume={autoRefresh.resume}
          />
        </div>

        <div className="mb-6">
          <HealthAlerts data={data} />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Livestock Dashboard
              </h1>
              <p className="text-text-secondary">
                Manage and monitor your livestock inventory across{" "}
                {stats?.counties || 0} counties
                {autoRefresh.isPaused && (
                  <span className="ml-2 text-yellow-600 font-medium">
                    • Updates Paused
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {stats && <StatisticsCards stats={stats} />}
          </div>
          <div className="lg:col-span-1">
            <RegistrationForm onAnimalAdded={refetch} />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Analytics & Insights
          </h2>
          <AnalyticsDashboard data={initialFilteredData} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1 w-full">
            <FilterBar
              filters={filters}
              onFilterChange={updateFilter}
              data={data}
            />
          </div>
          <div className="w-full sm:w-auto">
            <ExportButton data={displayData} filename="livestock-dashboard" />
          </div>
        </div>

        <div className="mb-6">
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            placeholder="Search animals by name, owner, type, county, or ID..."
          />
        </div>

        <div className="mb-6">
          <div className="card">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-2">
                  Livestock Overview
                </h2>
                <p className="text-text-secondary">
                  Showing{" "}
                  <span className="font-semibold text-accent">
                    {displayData.length}
                  </span>{" "}
                  animals out of{" "}
                  <span className="font-semibold text-text-primary">
                    {data.length}
                  </span>{" "}
                  total
                  {filters.type && ` • Type: ${filters.type}`}
                  {filters.health && ` • Health: ${filters.health}`}
                  {filters.county && ` • County: ${filters.county}`}
                  {searchQuery && " • Search Active"}
                </p>
              </div>

              {autoRefresh.lastRefresh && (
                <div className="text-xs text-text-tertiary">
                  Updated: {autoRefresh.lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimalList data={displayData} />

        {(filters.type || filters.health || filters.county || searchQuery) && (
          <div className="text-center mt-6">
            <button onClick={handleResetAll} className="btn btn-secondary">
              Reset All Filters & Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
