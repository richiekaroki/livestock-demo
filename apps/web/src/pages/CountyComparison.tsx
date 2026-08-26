import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";

interface CountyData {
  county: string;
  totalAnimals: number;
  healthy: number;
  sick: number;
  underTreatment: number;
  recovered: number;
  healthyRate: number;
  animalTypes: Record<string, number>;
  vaccinatedCount: number;
  vaccinationRate: number;
  mortalityCount: number;
  mortalityRate: number;
  outbreakCount: number;
  outbreakDiseases: string[];
}

type SortKey = "totalAnimals" | "healthyRate" | "vaccinationRate" | "mortalityRate" | "outbreakCount";

const SORT_OPTIONS: { key: SortKey; labelKey: string; icon: JSX.Element }[] = [
  { key: "totalAnimals", labelKey: "comparison.total", icon: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )},
  { key: "healthyRate", labelKey: "comparison.healthyRate", icon: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )},
  { key: "vaccinationRate", labelKey: "comparison.vaccinationRate", icon: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 21h10" /><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h4" /><path d="M12 9v6" />
    </svg>
  )},
  { key: "mortalityRate", labelKey: "comparison.mortalityRate", icon: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )},
  { key: "outbreakCount", labelKey: "comparison.outbreaks", icon: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )},
];

export default function CountyComparison() {
  const { t } = useTranslation();
  const [data, setData] = useState<CountyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("totalAnimals");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    backend.getCountyComparison().then((res) => {
      if (res.success && res.data) setData(res.data as CountyData[]);
      setLoading(false);
    });
  }, []);

  const sorted = [...data].sort((a, b) => {
    const mul = sortDir === "desc" ? -1 : 1;
    return (a[sortBy] - b[sortBy]) * mul;
  });

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortBy(key); setSortDir("desc"); }
  };

  const getBarColor = (value: number, max: number) => {
    const ratio = max > 0 ? value / max : 0;
    if (ratio >= 0.7) return "bg-success";
    if (ratio >= 0.4) return "bg-warning";
    return "bg-error";
  };

  const getBarWidth = (value: number, max: number) => {
    return `${max > 0 ? (value / max) * 100 : 0}%`;
  };

  const maxAnimals = Math.max(...data.map((d) => d.totalAnimals), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              {t("comparison.title")}
            </h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl">
          {t("comparison.desc")}
        </p>
      </div>

      {/* Sort controls */}
      <div className="bg-bg-secondary rounded-2xl border border-border p-4 mb-6">
        <p className="text-xs font-medium text-text-tertiary mb-2.5 uppercase tracking-wider">Sort by</p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map(({ key, labelKey, icon }) => {
            const active = sortBy === key;
            return (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors min-h-[36px] cursor-pointer ${
                  active
                    ? "bg-accent text-white shadow-sm"
                    : "bg-bg-primary text-text-secondary border border-border hover:border-accent/30"
                }`}
              >
                {icon}
                {t(labelKey)}
                {active && (
                  <span className="ml-0.5">{sortDir === "desc" ? "↓" : "↑"}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-bg-secondary rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map((c, idx) => (
            <div
              key={c.county}
              className="bg-bg-secondary rounded-2xl border border-border p-4 sm:p-5 hover:border-accent/20 transition-colors"
            >
              {/* County header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-text-tertiary w-5">{idx + 1}</span>
                  <h2 className="font-semibold text-text-primary">{c.county}</h2>
                </div>
                <span className="text-sm font-semibold text-accent">
                  {c.totalAnimals.toLocaleString()} <span className="text-text-tertiary font-normal">{t("comparison.animals")}</span>
                </span>
              </div>

              {/* Bar */}
              <div className="w-full bg-border rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-[width] duration-500 ${getBarColor(c.totalAnimals, maxAnimals)}`}
                  style={{ width: getBarWidth(c.totalAnimals, maxAnimals) }}
                />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-bg-primary rounded-xl p-2.5 text-center border border-border/50">
                  <div className="text-lg font-bold text-success">{c.healthyRate}%</div>
                  <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">{t("comparison.healthy")}</div>
                </div>
                <div className="bg-bg-primary rounded-xl p-2.5 text-center border border-border/50">
                  <div className="text-lg font-bold text-info">{c.vaccinationRate}%</div>
                  <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">{t("comparison.vaccinated")}</div>
                </div>
                <div className="bg-bg-primary rounded-xl p-2.5 text-center border border-border/50">
                  <div className="text-lg font-bold text-error">{c.mortalityRate}%</div>
                  <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">{t("comparison.mortality")}</div>
                </div>
                <div className="bg-bg-primary rounded-xl p-2.5 text-center border border-border/50">
                  <div className="text-lg font-bold text-warning">{c.outbreakCount}</div>
                  <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">{t("comparison.outbreaks")}</div>
                </div>
                <div className="bg-bg-primary rounded-xl p-2.5 text-center border border-border/50">
                  <div className="text-lg font-bold text-text-primary">{c.sick}</div>
                  <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">{t("comparison.sick")}</div>
                </div>
              </div>

              {/* Disease tags */}
              {c.outbreakDiseases.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                  {c.outbreakDiseases.map((d) => (
                    <span key={d} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-warning/10 text-warning border border-warning/20">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-16 bg-bg-secondary rounded-2xl border border-dashed border-border">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">No county data available</p>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            Register livestock in different counties to see comparative analytics across regions.
          </p>
        </div>
      )}
    </div>
  );
}
