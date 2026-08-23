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

const RISK_COLORS: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#16a34a",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t("What-If Simulator", "What-If Simulator")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("Project the impact of vaccination campaigns on disease risk", "Project the impact of vaccination campaigns on disease risk")}
        </p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)] mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              {t("County", "County")}
            </label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              <option value="">{t("Select county", "Select county")}</option>
              {counties.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              {t("Vaccination Increase", "Vaccination Increase")}: {vaccinationIncrease}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={vaccinationIncrease}
              onChange={(e) => setVaccinationIncrease(Number(e.target.value))}
              className="w-full accent-[var(--color-primary)]"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              {t("Livestock Reduction", "Livestock Reduction")}: {livestockReduction}%
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={livestockReduction}
              onChange={(e) => setLivestockReduction(Number(e.target.value))}
              className="w-full accent-[var(--color-primary)]"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSimulate}
            disabled={!county || loading}
            className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {loading ? t("Simulating...", "Simulating...") : t("Run Simulation", "Run Simulation")}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {t("Simulation Results", "Simulation Results")} - {result.county}
          </h2>

          <div className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)] mb-4">
            <div className="text-sm text-[var(--color-text-secondary)]">
              {t("Scenario", "Scenario")}: +{result.scenario.vaccinationIncrease}% {t("vaccination", "vaccination")},
              -{result.scenario.livestockReduction}% {t("livestock", "livestock")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.results.map((r, i) => (
              <div key={i} className="bg-[var(--color-surface)] rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-[var(--color-text)]">{r.diseaseType}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white capitalize"
                      style={{ backgroundColor: RISK_COLORS[r.currentRiskLevel] }}
                    >
                      {r.currentRiskLevel}
                    </span>
                    <span className="text-[var(--color-text-secondary)]">&rarr;</span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white capitalize"
                      style={{ backgroundColor: RISK_COLORS[r.projectedRiskLevel] }}
                    >
                      {r.projectedRiskLevel}
                    </span>
                  </div>
                </div>
                {r.change === "improved" && (
                  <div className="text-xs text-green-600 font-medium mb-2">
                    {t("Risk reduced!", "Risk reduced!")}
                  </div>
                )}
                <div className="space-y-1">
                  {r.factors.map((f) => (
                    <div key={f.name} className="text-xs text-[var(--color-text-secondary)]">
                      {f.description} ({Math.round(f.weight * 100)}%)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.results.length === 0 && (
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          {t("No simulation results. Try adjusting the parameters.", "No simulation results. Try adjusting the parameters.")}
        </div>
      )}
    </div>
  );
}
