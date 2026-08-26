import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";
import type { County } from "@wam-mfugo/shared";

interface SimulationResult {
  county: string;
  scenario: {
    vaccinationIncrease: number;
    livestockReduction: number;
    season: string;
  };
  results: {
    diseaseType: string;
    currentRiskLevel: string;
    projectedRiskLevel: string;
    change: string;
    factors: { name: string; weight: number; description: string }[];
  }[];
}

const RISK_LEVELS: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-error/10", text: "text-error", label: "Critical" },
  high: { bg: "bg-warning/10", text: "text-warning", label: "High" },
  medium: { bg: "bg-accent-gold/10", text: "text-accent-gold", label: "Medium" },
  low: { bg: "bg-success/10", text: "text-success", label: "Low" },
};

export default function WhatIfSimulator() {
  const { t } = useTranslation();
  const [counties, setCounties] = useState<County[]>([]);
  const [county, setCounty] = useState("");
  const [vaccinationIncrease, setVaccinationIncrease] = useState(20);
  const [livestockReduction, setLivestockReduction] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    backend.getCounties().then((res) => {
      if (res.success && res.data) setCounties(res.data as County[]);
    });
  }, []);

  const handleSimulate = async () => {
    if (!county) return;
    setLoading(true);
    try {
      const res = await backend.simulateWhatIf({
        county,
        vaccinationIncrease,
        livestockReduction,
      });
      if (res.success && res.data) setResult(res.data as SimulationResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              {t("simulator.title")}
            </h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl">
          {t("simulator.desc")}
        </p>
      </div>

      {/* Scenario Builder */}
      <div className="bg-bg-secondary rounded-2xl border border-border p-5 sm:p-6 mb-8">
        <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Scenario Builder
        </h2>

        <div className="space-y-5">
          {/* County select */}
          <div>
            <label htmlFor="sim-county" className="block text-sm font-medium text-text-primary mb-2">
              {t("simulator.county")}
            </label>
            <select
              id="sim-county"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
              <option value="">{t("simulator.selectCounty")}</option>
              {counties.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="sim-vaccination" className="block text-sm font-medium text-text-primary mb-2">
                {t("simulator.vaccinationIncrease")}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="sim-vaccination"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={vaccinationIncrease}
                  onChange={(e) => setVaccinationIncrease(Number(e.target.value))}
                  className="flex-1 accent-accent h-2 rounded-full appearance-none bg-border cursor-pointer"
                />
                <span className="text-sm font-bold text-accent min-w-[3rem] text-right">
                  +{vaccinationIncrease}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-text-tertiary mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label htmlFor="sim-reduction" className="block text-sm font-medium text-text-primary mb-2">
                {t("simulator.livestockReduction")}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="sim-reduction"
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={livestockReduction}
                  onChange={(e) => setLivestockReduction(Number(e.target.value))}
                  className="flex-1 accent-accent h-2 rounded-full appearance-none bg-border cursor-pointer"
                />
                <span className="text-sm font-bold text-warning min-w-[3rem] text-right">
                  -{livestockReduction}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-text-tertiary mt-1">
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Run button */}
        <div className="mt-6">
          <button
            onClick={handleSimulate}
            disabled={!county || loading}
            className="w-full sm:w-auto rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-transform transition-colors min-h-[44px] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                {t("simulator.simulating")}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {t("simulator.run")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {t("simulator.results")}
            </h2>
            <span className="text-sm text-text-secondary bg-bg-secondary px-3 py-1 rounded-full border border-border">
              {result.county}
            </span>
          </div>

          {/* Scenario summary */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              +{result.scenario.vaccinationIncrease}% vaccination
            </span>
            {result.scenario.livestockReduction > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                -{result.scenario.livestockReduction}% livestock
              </span>
            )}
          </div>

          {result.results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.results.map((r, i) => {
                const current = RISK_LEVELS[r.currentRiskLevel] || RISK_LEVELS.medium;
                const projected = RISK_LEVELS[r.projectedRiskLevel] || RISK_LEVELS.medium;
                const improved = r.change === "improved";

                return (
                  <div
                    key={i}
                    className="bg-bg-secondary rounded-2xl border border-border p-5 hover:border-accent/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-text-primary">{r.diseaseType}</h3>
                      {improved && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                          </svg>
                          Reduced
                        </span>
                      )}
                    </div>

                    {/* Risk level transition */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${current.bg} ${current.text}`}>
                        {current.label}
                      </div>
                      <svg className="w-4 h-4 text-text-tertiary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${projected.bg} ${projected.text}`}>
                        {projected.label}
                      </div>
                    </div>

                    {/* Factors */}
                    <div className="space-y-2">
                      {r.factors.map((f) => (
                        <div key={f.name} className="flex items-start gap-2 text-xs text-text-secondary">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-1.5 shrink-0" />
                          <span>{f.description}</span>
                          <span className="text-text-tertiary ml-auto shrink-0">{Math.round(f.weight * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary">
              {t("simulator.empty")}
            </div>
          )}
        </div>
      )}

      {/* Empty state — before simulation */}
      {!result && !loading && (
        <div className="text-center py-12 bg-bg-secondary rounded-2xl border border-dashed border-border">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-info/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary mb-1">Select a county and adjust the parameters above to see projected outcomes.</p>
          <p className="text-xs text-text-tertiary">Results are based on current disease risk models and vaccination data.</p>
        </div>
      )}
    </div>
  );
}
