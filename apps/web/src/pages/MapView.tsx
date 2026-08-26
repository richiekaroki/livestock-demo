// src/pages/MapView.tsx
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FilterBar from "../components/ui/FilterBar";
import LivestockMap from "../components/map/LivestockMap";
import { useLivestockStore } from "../store/livestockStore";
import type { Livestock } from "@wam-mfugo/shared";

interface MapViewProps {
  data: Livestock[];
  allData: Livestock[];
  loading: boolean;
}

function StatsSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm animate-pulse" role="status" aria-busy="true" aria-label="Loading map statistics">
      <div className="flex items-center gap-2">
        <span className="text-text-tertiary">{t("map.showing")}</span>
        <span className="w-8 h-4 bg-bg-tertiary rounded" />
        <span className="text-text-tertiary">{t("map.animals")}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-text-tertiary">{t("map.across")}</span>
        <span className="w-4 h-4 bg-bg-tertiary rounded" />
        <span className="text-text-tertiary">{t("map.counties")}</span>
      </div>
    </div>
  );
}

function ActiveFilterChips({
  filters,
  onRemove,
}: {
  filters: { type?: string; county?: string; health?: string };
  onRemove: (key: "type" | "county" | "health") => void;
}) {
  const { t } = useTranslation();
  const chips: { key: keyof typeof filters; label: string }[] = [];
  if (filters.type) chips.push({ key: "type", label: `${t("dashboard.type_filter")} ${filters.type}` });
  if (filters.health) chips.push({ key: "health", label: `${t("dashboard.health_filter")} ${filters.health}` });
  if (filters.county) chips.push({ key: "county", label: `${t("dashboard.county_filter")} ${filters.county}` });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-colors cursor-pointer min-h-[44px]"
          role="listitem"
          aria-label={`${t("map.remove_filter")}${chip.label}`}
        >
          {chip.label}
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function MapView({ data, allData, loading }: MapViewProps) {
  const { t } = useTranslation();
  const filters = useLivestockStore((s) => s.filters);
  const updateFilter = useLivestockStore((s) => s.updateFilter);

  const stats = useMemo(() => {
    if (!allData.length) return null;
    const counties = new Set<string>();
    let healthy = 0;
    let sick = 0;
    for (const a of allData) {
      counties.add(a.county);
      if (a.health === "Healthy") healthy++;
      else if (a.health === "Sick") sick++;
    }
    return {
      total: allData.length,
      counties: counties.size,
      healthy,
      sick,
      healthyPercent: Math.round((healthy / allData.length) * 100),
    };
  }, [allData]);

  return (
    <div className="space-y-4" role="region" aria-label="Livestock map view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            {t("map.title")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("map.desc")}
          </p>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[280px]">
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
          />
        </div>
      </div>

      {/* Active filter chips */}
      <ActiveFilterChips
        filters={filters}
        onRemove={(key) => updateFilter(key, "")}
      />

      {/* Stats strip */}
      <div className="border-b border-border pb-4">
        {loading && !stats ? (
          <StatsSkeleton />
        ) : stats ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" aria-label="Map statistics summary" aria-live="polite" aria-atomic="true">
            <div className="flex items-center gap-2">
              <span className="text-text-tertiary">{t("map.showing")}</span>
              <span className="font-semibold font-mono text-accent">
                {data.length.toLocaleString()}
              </span>
              <span className="text-text-tertiary">
                {t("dashboard.of")} {stats.total.toLocaleString()} {t("map.animals")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-tertiary">{t("map.across")}</span>
              <span className="font-semibold font-mono text-text-primary">
                {stats.counties}
              </span>
              <span className="text-text-tertiary">{t("map.counties")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-tertiary">{t("map.health_rate")}</span>
              <span className="font-semibold font-mono text-success">
                {stats.healthyPercent}%
              </span>
            </div>
            {stats.sick > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="font-semibold font-mono text-error">
                  {stats.sick}
                </span>
                <span className="text-text-tertiary">
                  {stats.sick === 1 ? t("home.animal_needs") : t("home.animals_needs")}{t("map.need_attention")}
                </span>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Map */}
      <div className="card p-0 overflow-hidden">
        <LivestockMap data={data} />
      </div>
    </div>
  );
}
