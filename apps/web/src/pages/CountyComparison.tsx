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
    if (ratio >= 0.7) return "#16a34a";
    if (ratio >= 0.4) return "#ca8a04";
    return "#dc2626";
  };

  const maxAnimals = Math.max(...data.map((d) => d.totalAnimals), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t("County Comparison", "County Comparison")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("Compare livestock metrics across all counties", "Compare livestock metrics across all counties")}
        </p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)] mb-6">
        <div className="flex flex-wrap gap-2">
          {([
            ["totalAnimals", t("Total Animals", "Total Animals")],
            ["healthyRate", t("Healthy Rate", "Healthy Rate")],
            ["vaccinationRate", t("Vaccination Rate", "Vaccination Rate")],
            ["mortalityRate", t("Mortality Rate", "Mortality Rate")],
            ["outbreakCount", t("Outbreaks", "Outbreaks")],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[36px]"
            >
              {label} {sortBy === key ? (sortDir === "desc" ? "\u2193" : "\u2191") : ""}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((c) => (
            <div key={c.county} className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[var(--color-text)]">{c.county}</h3>
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                  {c.totalAnimals} {t("animals", "animals")}
                </span>
              </div>

              <div className="w-full bg-[var(--color-border)] rounded-full h-3 mb-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(c.totalAnimals / maxAnimals) * 100}%`,
                    backgroundColor: getBarColor(c.totalAnimals, maxAnimals),
                  }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">{c.healthyRate}%</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{t("Healthy", "Healthy")}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{c.vaccinationRate}%</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{t("Vaccinated", "Vaccinated")}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{c.mortalityRate}%</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{t("Mortality", "Mortality")}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{c.outbreakCount}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{t("Outbreaks", "Outbreaks")}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[var(--color-text)]">{c.sick}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{t("Sick", "Sick")}</div>
                </div>
              </div>

              {c.outbreakDiseases.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.outbreakDiseases.map((d) => (
                    <span key={d} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.length === 0 && !loading && (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          {t("No county data available.", "No county data available.")}
        </div>
      )}
    </div>
  );
}
