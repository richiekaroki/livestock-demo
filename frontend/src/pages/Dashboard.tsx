// src/pages/Dashboard.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type Tab = "overview" | "animals" | "analytics" | "register";

export default function Dashboard({
  data,
  filteredData: initialFilteredData,
  loading,
  error,
  refetch,
}: DashboardProps) {
  const [stats, setStats] = useState<AnimalStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
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
        // statistics load failed silently — non-critical
      }
    };
    loadStats();
  }, [data]);

  if (loading && !data.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading livestock data..." />
      </div>
    );
  }

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let newIndex = index;
      if (e.key === "ArrowRight") {
        newIndex = (index + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        newIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        newIndex = 0;
      } else if (e.key === "End") {
        newIndex = tabs.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      setActiveTab(tabs[newIndex].id);
      tabRefs.current[newIndex]?.focus();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "animals", label: "Animals" },
    { id: "analytics", label: "Analytics" },
    { id: "register", label: "Register" },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6">
            <StatusIndicator error={error} />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-1 tracking-tight">
              Livestock Dashboard
            </h1>
            <p className="text-text-secondary">
              Manage and monitor your livestock inventory across{" "}
              <span className="font-semibold text-accent">{stats?.counties || 0}</span> counties
              {autoRefresh.isPaused && (
                <span className="ml-2 text-warning font-medium">
                  &bull; Updates Paused
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RefreshIndicator
              isRefreshing={autoRefresh.isRefreshing}
              lastRefresh={autoRefresh.lastRefresh}
              countdown={autoRefresh.countdown}
              isPaused={autoRefresh.isPaused}
              onRefresh={autoRefresh.triggerRefresh}
              onPause={autoRefresh.pause}
              onResume={autoRefresh.resume}
            />
            <KALROSyncStatus />
          </div>
        </div>

        {/* Tabs */}
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Dashboard sections"
          className="flex gap-1 border-b border-border mb-6"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" hidden={activeTab !== "overview"} inert={activeTab !== "overview"}>
          <HealthAlerts data={data} />

          <div className="mt-6">
            {stats && <StatisticsCards stats={stats} />}
          </div>
        </div>

        {/* Tab: Register */}
        <div role="tabpanel" id="panel-register" aria-labelledby="tab-register" hidden={activeTab !== "register"} inert={activeTab !== "register"}>
          <RegistrationForm onAnimalAdded={refetch} />
        </div>

        {/* Tab: Animals */}
        <div role="tabpanel" id="panel-animals" aria-labelledby="tab-animals" hidden={activeTab !== "animals"} inert={activeTab !== "animals"}>
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

          <div className="mb-4">
            <SearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              placeholder="Search animals by name, owner, type, county, or ID..."
            />
          </div>

          <div className="mb-4">
            <div className="card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-text-secondary">
                    Showing{" "}
                    <span className="font-semibold text-accent">
                      {displayData.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-text-primary">
                      {data.length}
                    </span>{" "}
                    animals
                    {filters.type && ` \u2022 Type: ${filters.type}`}
                    {filters.health && ` \u2022 Health: ${filters.health}`}
                    {filters.county && ` \u2022 County: ${filters.county}`}
                    {searchQuery && " \u2022 Search Active"}
                  </p>
                </div>
                {autoRefresh.lastRefresh && (
                  <div className="text-xs text-text-tertiary font-mono">
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
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Tab: Analytics */}
        <div role="tabpanel" id="panel-analytics" aria-labelledby="tab-analytics" hidden={activeTab !== "analytics"} inert={activeTab !== "analytics"}>
          <AnalyticsDashboard data={initialFilteredData} />
        </div>
      </div>
    </div>
  );
}
