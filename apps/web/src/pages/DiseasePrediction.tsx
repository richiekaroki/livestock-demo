import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";
import type { County } from "@wam-mfugo/shared";

interface RiskFactor {
  name: string;
  weight: number;
  value: number;
  description: string;
}

interface DiseaseRisk {
  id: number;
  county: string;
  diseaseType: string;
  riskLevel: string;
  confidence: number;
  factors: RiskFactor[];
  lastCalculated: string;
}

interface CountySummary {
  county: string;
  totalDiseases: number;
  riskBreakdown: { critical: number; high: number; medium: number; low: number };
  highestRisk: string;
}

const RISK_STYLES: Record<string, { color: string; bg: string }> = {
  critical: { color: "text-error", bg: "bg-error" },
  high: { color: "text-warning", bg: "bg-warning" },
  medium: { color: "text-accent-gold", bg: "bg-accent-gold" },
  low: { color: "text-success", bg: "bg-success" },
};

export default function DiseasePrediction() {
  const { t } = useTranslation();
  const [counties, setCounties] = useState<County[]>([]);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [risks, setRisks] = useState<DiseaseRisk[]>([]);
  const [summary, setSummary] = useState<CountySummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    backend.getCounties().then((res) => {
      if (res.success && res.data) setCounties(res.data as County[]);
    });
  }, []);

  const handlePredict = async () => {
    if (!selectedCounty) return;
    setLoading(true);
    try {
      const [riskRes, summaryRes] = await Promise.all([
        backend.predictDiseaseRisk({ county: selectedCounty }),
        backend.getCountyRiskSummary(selectedCounty),
      ]);
      if (riskRes.success && riskRes.data) setRisks(riskRes.data as DiseaseRisk[]);
      if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data as CountySummary);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {t("diseases.title")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t("diseases.desc")}
        </p>
      </div>

      <div className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="disease-county" className="block text-sm font-medium text-text-primary mb-2">
              {t("diseases.county")}
            </label>
            <select
              id="disease-county"
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">{t("diseases.select_county")}</option>
              {counties.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handlePredict}
              disabled={!selectedCounty || loading}
              className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              {loading ? t("diseases.predicting") : t("diseases.predict")}
            </button>
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {(["critical", "high", "medium", "low"] as const).map((level) => (
            <div
              key={level}
              className="bg-bg-secondary rounded-xl p-4 shadow-sm border border-border"
            >
              <div className="text-sm font-medium text-text-secondary capitalize">
                {t(`diseases.${level}`)}
              </div>
              <div
                className={`text-2xl font-bold mt-1 ${RISK_STYLES[level]?.color || "text-text-secondary"}`}
              >
                {summary.riskBreakdown[level]}
              </div>
            </div>
          ))}
        </div>
      )}

      {risks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t("diseases.risk_assessment")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className="bg-bg-secondary rounded-xl p-5 shadow-sm border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-text-primary">
                    {risk.diseaseType}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white capitalize ${RISK_STYLES[risk.riskLevel]?.bg || "bg-text-secondary"}`}
                  >
                    {risk.riskLevel}
                  </span>
                </div>
                <div className="text-sm text-text-secondary mb-3">
                  {t("diseases.confidence")}: {Math.round(risk.confidence * 100)}%
                </div>
                <div className="space-y-2">
                  {risk.factors.map((factor) => (
                    <div key={factor.name} className="text-xs">
                      <div className="flex justify-between text-text-secondary">
                        <span>{factor.description}</span>
                        <span>{Math.round(factor.weight * 100)}%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${RISK_STYLES[risk.riskLevel]?.bg || "bg-text-secondary"}`}
                          style={{
                            width: `${Math.min(100, factor.weight * 100 * 3)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-text-secondary mt-3">
                  {t("diseases.last_calculated")}:{" "}
                  {new Date(risk.lastCalculated).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {risks.length === 0 && !loading && selectedCounty && (
        <div className="text-center py-12 text-text-secondary">
          {t("diseases.no_data")}
        </div>
      )}
    </div>
  );
}
