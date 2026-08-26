// src/pages/Dashboard.tsx
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import HealthAlerts from "../components/alerts/HealthAlerts";
import AnimalList from "../components/animals/AnimalList";
import RegistrationForm from "../components/animals/RegistrationForm";
import StatisticsCards from "../components/dashboard/StatisticsCards";
import StatusIndicator from "../components/dashboard/StatusIndicator";
import ExportButton from "../components/ui/ExportButton";
import FilterBar from "../components/ui/FilterBar";
import SearchBar from "../components/ui/SearchBar";
import KALROSyncStatus from "../components/ui/KALROSyncStatus";
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

const QUICK_ACTIONS = [
  {
    labelKey: "dashboard.action_register",
    fallback: "Register Animal",
    route: "/register",
    color: "bg-accent/10 text-accent",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    labelKey: "dashboard.action_health",
    fallback: "Health Check",
    route: "/health",
    color: "bg-success/10 text-success",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    labelKey: "dashboard.action_reports",
    fallback: "Reports",
    route: "/reports",
    color: "bg-info/10 text-info",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    labelKey: "dashboard.action_map",
    fallback: "Map View",
    route: "/map",
    color: "bg-warning/10 text-warning",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    labelKey: "dashboard.action_disease",
    fallback: "Disease Tracker",
    route: "/disease-prediction",
    color: "bg-error/10 text-error",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

export default function Dashboard({
  data,
  filteredData: initialFilteredData,
  loading,
  error,
  refetch,
}: DashboardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { connected: wsConnected, stats: realTimeStats, subscribe } = useWebSocket();
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

  useEffect(() => {
    const unsub = subscribe("animal:event", () => {
      refetch();
    });
    return unsub;
  }, [subscribe, refetch]);

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

  const localStats = useMemo<AnimalStats | null>(() => {
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

  const stats: AnimalStats | null = realTimeStats ?? localStats;

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-24 md:pb-8">
        {error && (
          <div className="mb-6">
            <StatusIndicator error={error} />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-1 tracking-tight">
              {t("dashboard.title")}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary">
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
        <div className="relative">
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Dashboard sections"
            className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-border mb-6 -mx-4 px-4 md:mx-0 md:px-0"
          >
          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[index] = el; }}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer min-h-[44px] ${
                  isActive
                    ? "text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            );
          })}
          </div>
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
            {stats ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Stats + Quick Actions */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                  <StatisticsCards stats={stats} />

                  {/* Quick Actions */}
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary mb-3">
                      {t("dashboard.quick_actions")}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.route}
                          onClick={() => navigate(action.route)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${action.color} hover:opacity-80`}
                        >
                          {action.icon}
                          <span>{t(action.labelKey, { defaultValue: action.fallback })}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Health Alerts */}
                <div className="lg:col-span-2">
                  <HealthAlerts data={data} />
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <p className="text-text-secondary">{t("dashboard.no_data")}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Register */}
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

            <AnimalList data={displayData} onRefresh={refetch} />
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
