// src/pages/Dashboard.tsx
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import HealthAlerts from "../components/alerts/HealthAlerts";
import AnimalList from "../components/animals/AnimalList";
import RegistrationForm from "../components/animals/RegistrationForm";
import StatisticsCards from "../components/dashboard/StatisticsCards";
import StatusIndicator from "../components/dashboard/StatusIndicator";
import ExportButton from "../components/export/ExportButton";
import FilterBar from "../components/filters/FilterBar";
import SearchBar from "../components/search/SearchBar";
import KALROSyncStatus from "../components/sync/KALROSyncStatus";
import LiveIndicator from "../components/dashboard/LiveIndicator";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { useWebSocket } from "../hooks/useWebSocket";
import { useLivestockStore } from "../store/livestockStore";
import type { AnimalStats, Livestock } from "@wam-mfugo/shared";
import { debounce } from "../utils/debounce";

interface DashboardProps {
  data: Livestock[];
  filteredData: Livestock[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

type Tab = "overview" | "animals" | "analytics" | "register";

const AnalyticsDashboard = lazy(
  () => import("../components/analytics/AnalyticsDashboard")
);

export default function Dashboard({
  data,
  filteredData: initialFilteredData,
  loading,
  error,
  refetch,
}: DashboardProps) {
  const { t } = useTranslation();
  const { connected: wsConnected } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const filters = useLivestockStore((s) => s.filters);
  const updateFilter = useLivestockStore((s) => s.updateFilter);

  const TABS = useMemo<{ id: Tab; label: string }[]>(
    () => [
      { id: "overview", label: t("dashboard.tab_overview") },
      { id: "animals", label: t("dashboard.tab_animals") },
      { id: "analytics", label: t("dashboard.tab_analytics") },
      { id: "register", label: t("dashboard.tab_register") },
    ],
    [t]
  );

  const updateDebouncedQuery = useMemo(
    () => debounce((q: string) => setDebouncedQuery(q), 200),
    []
  );

  useEffect(() => () => updateDebouncedQuery.cancel(), [updateDebouncedQuery]);

  const handleSearchChange = useCallback(
    (q: string) => {
      setSearchQuery(q);
      updateDebouncedQuery(q);
    },
    [updateDebouncedQuery]
  );

  useAutoRefresh({
    enabled: true,
    interval: 30000,
    onRefresh: refetch,
    showCountdown: false,
  });

  const displayData = useMemo(() => {
    if (!debouncedQuery.trim()) return initialFilteredData;

    const query = debouncedQuery.toLowerCase();
    return initialFilteredData.filter(
      (animal) =>
        animal.name.toLowerCase().includes(query) ||
        animal.owner.toLowerCase().includes(query) ||
        animal.type.toLowerCase().includes(query) ||
        animal.county.toLowerCase().includes(query) ||
        animal.id.toString().includes(query)
    );
  }, [initialFilteredData, debouncedQuery]);

  const stats = useMemo<AnimalStats | null>(() => {
    if (!data.length) return null;

    let healthyCount = 0;
    let sickCount = 0;
    let underTreatmentCount = 0;
    let recoveredCount = 0;
    const counties = new Set<string>();

    for (const animal of data) {
      counties.add(animal.county);
      switch (animal.health) {
        case "Healthy":
          healthyCount++;
          break;
        case "Sick":
          sickCount++;
          break;
        case "Under Treatment":
          underTreatmentCount++;
          break;
        case "Recovered":
          recoveredCount++;
          break;
      }
    }

    return {
      totalAnimals: data.length,
      healthyCount,
      sickCount,
      underTreatmentCount,
      recoveredCount,
      counties: counties.size,
      lastUpdated: new Date().toISOString(),
    };
  }, [data]);

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let newIndex = index;
      if (e.key === "ArrowRight") {
        newIndex = (index + 1) % TABS.length;
      } else if (e.key === "ArrowLeft") {
        newIndex = (index - 1 + TABS.length) % TABS.length;
      } else if (e.key === "Home") {
        newIndex = 0;
      } else if (e.key === "End") {
        newIndex = TABS.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      setActiveTab(TABS[newIndex].id);
      tabRefs.current[newIndex]?.focus();
    },
    [TABS]
  );

  if (loading && !data.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text={t("dashboard.loading")} />
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-1 tracking-tight">
              {t("dashboard.title")}
            </h1>
            <p className="text-text-secondary">
              {t("dashboard.desc")}{" "}
              <span className="font-semibold text-accent">{stats?.counties || 0}</span> {t("home.stats_counties")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveIndicator connected={wsConnected} />
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
          {TABS.map((tab, index) => (
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
        {activeTab === "overview" && (
          <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
            <HealthAlerts data={data} />

            <div className="mt-6">
              {stats && <StatisticsCards stats={stats} />}
            </div>
          </div>
        )}

        {/* Tab: Register — kept mounted so in-progress form state survives tab switches */}
        <div role="tabpanel" id="panel-register" aria-labelledby="tab-register" hidden={activeTab !== "register"} inert={activeTab !== "register"}>
          <RegistrationForm onAnimalAdded={refetch} />
        </div>

        {/* Tab: Animals */}
        {activeTab === "animals" && (
          <div role="tabpanel" id="panel-animals" aria-labelledby="tab-animals">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex-1 w-full">
                <FilterBar
                  filters={filters}
                  onFilterChange={updateFilter}
                />
              </div>
              <div className="w-full sm:w-auto">
                <ExportButton data={displayData} filename="livestock-dashboard" />
              </div>
            </div>

            <div className="mb-4">
              <SearchBar
                query={searchQuery}
                onQueryChange={handleSearchChange}
                placeholder={t("dashboard.search_placeholder")}
              />
            </div>

            <div className="mb-4">
              <div className="card p-4" role="status" aria-live="polite" aria-atomic="true">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-text-secondary">
                      {t("dashboard.showing")}{" "}
                      <span className="font-semibold text-accent">
                        {displayData.length}
                      </span>{" "}
                      {t("dashboard.of")}{" "}
                      <span className="font-semibold text-text-primary">
                        {data.length}
                      </span>{" "}
                      {t("dashboard.animals")}
                      {filters.type && ` \u2022 ${t("dashboard.type_filter")} ${filters.type}`}
                      {filters.health && ` \u2022 ${t("dashboard.health_filter")} ${filters.health}`}
                      {filters.county && ` \u2022 ${t("dashboard.county_filter")} ${filters.county}`}
                      {searchQuery && ` \u2022 ${t("dashboard.search_active")}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <AnimalList data={displayData} />
          </div>
        )}

        {/* Tab: Analytics */}
        {activeTab === "analytics" && (
          <div role="tabpanel" id="panel-analytics" aria-labelledby="tab-analytics">
            <Suspense fallback={<LoadingSpinner text={t("dashboard.loading_analytics")} />}>
              <AnalyticsDashboard data={initialFilteredData} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
