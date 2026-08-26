import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";

interface CoverageData {
  county: string;
  totalAnimals: number;
  vaccinatedAnimals: number;
  coveragePercent: number;
  vaccinationTypes: Record<string, number>;
  lastVaccinated?: string;
}

export default function VaccinationCoverage() {
  const { t } = useTranslation();
  const [data, setData] = useState<CoverageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.getVaccinationCoverage().then((res) => {
      if (res.success && res.data) setData(res.data as CoverageData[]);
      setLoading(false);
    });
  }, []);

  const getCoverageColor = (pct: number) => {
    if (pct >= 80) return "#16a34a";
    if (pct >= 50) return "#ca8a04";
    if (pct >= 20) return "#ea580c";
    return "#dc2626";
  };

  const totalAnimals = data.reduce((s, c) => s + c.totalAnimals, 0);
  const totalVaccinated = data.reduce((s, c) => s + c.vaccinatedAnimals, 0);
  const overallCoverage = totalAnimals > 0 ? Math.round((totalVaccinated / totalAnimals) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t("coverage.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("coverage.desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--color-surface)] rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-secondary)]">{t("coverage.total")}</div>
          <div className="text-2xl font-bold text-[var(--color-text)] mt-1">{totalAnimals.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-secondary)]">{t("coverage.vaccinated")}</div>
          <div className="text-2xl font-bold text-[var(--color-text)] mt-1">{totalVaccinated.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-secondary)]">{t("coverage.rate")}</div>
          <div className="text-2xl font-bold mt-1" style={{ color: getCoverageColor(overallCoverage) }}>
            {overallCoverage}%
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--color-surface)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((county) => (
            <div key={county.county} className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-[var(--color-text)]">{county.county}</div>
                <div className="text-sm font-semibold" style={{ color: getCoverageColor(county.coveragePercent) }}>
                  {county.coveragePercent}%
                </div>
              </div>
              <div className="w-full bg-[var(--color-border)] rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-[width] duration-500"
                  style={{
                    width: `${county.coveragePercent}%`,
                    backgroundColor: getCoverageColor(county.coveragePercent),
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                <span>{county.vaccinatedAnimals} / {county.totalAnimals} {t("coverage.animals")}</span>
                <span>{Object.keys(county.vaccinationTypes).length} {t("coverage.vaccineTypes")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.length === 0 && !loading && (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          {t("coverage.empty")}
        </div>
      )}
    </div>
  );
}
