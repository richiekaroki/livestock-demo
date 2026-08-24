import { useState } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";
import { KENYA_COUNTIES, LIVESTOCK_TYPES } from "@wam-mfugo/shared";
import type { Livestock } from "@wam-mfugo/shared";

interface ReportData {
  summary: {
    totalAnimals: number;
    healthy: number;
    sick: number;
    underTreatment: number;
    recovered: number;
    vaccinated: number;
    mortalityCount: number;
  };
  byCounty: { county: string; count: number; healthy: number; sick: number }[];
  byType: { type: string; count: number; healthy: number; sick: number }[];
  generatedAt: string;
}

export default function KalroReportBuilder() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [county, setCounty] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (county) params.county = county;
      if (animalType) params.type = animalType;
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const res = await backend.getAnimals(params as any);
      if (res.success && res.data) {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data: Livestock[] }).data;
        const animals = data || [];

        const byCounty: Record<string, { count: number; healthy: number; sick: number }> = {};
        const byType: Record<string, { count: number; healthy: number; sick: number }> = {};

        for (const a of animals) {
          if (!byCounty[a.county]) byCounty[a.county] = { count: 0, healthy: 0, sick: 0 };
          byCounty[a.county].count++;
          if (a.health === "Healthy") byCounty[a.county].healthy++;
          if (a.health === "Sick") byCounty[a.county].sick++;

          if (!byType[a.type]) byType[a.type] = { count: 0, healthy: 0, sick: 0 };
          byType[a.type].count++;
          if (a.health === "Healthy") byType[a.type].healthy++;
          if (a.health === "Sick") byType[a.type].sick++;
        }

        setReport({
          summary: {
            totalAnimals: animals.length,
            healthy: animals.filter((a) => a.health === "Healthy").length,
            sick: animals.filter((a) => a.health === "Sick").length,
            underTreatment: animals.filter((a) => a.health === "Under Treatment").length,
            recovered: animals.filter((a) => a.health === "Recovered").length,
            vaccinated: 0,
            mortalityCount: 0,
          },
          byCounty: Object.entries(byCounty).map(([county, d]) => ({ county, ...d })),
          byType: Object.entries(byType).map(([type, d]) => ({ type, ...d })),
          generatedAt: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    const rows: Record<string, string>[] = [];

    rows.push({ Section: "SUMMARY", Metric: "Total Animals", Value: String(report.summary.totalAnimals) });
    rows.push({ Section: "SUMMARY", Metric: "Healthy", Value: String(report.summary.healthy) });
    rows.push({ Section: "SUMMARY", Metric: "Sick", Value: String(report.summary.sick) });
    rows.push({ Section: "SUMMARY", Metric: "Under Treatment", Value: String(report.summary.underTreatment) });
    rows.push({ Section: "SUMMARY", Metric: "Recovered", Value: String(report.summary.recovered) });

    for (const c of report.byCounty) {
      rows.push({ Section: "BY_COUNTY", Metric: c.county, Value: `${c.count} total, ${c.healthy} healthy, ${c.sick} sick` });
    }
    for (const ty of report.byType) {
      rows.push({ Section: "BY_TYPE", Metric: ty.type, Value: `${ty.count} total, ${ty.healthy} healthy, ${ty.sick} sick` });
    }

    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((r) => Object.values(r).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kalro-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t("KALRO Report Builder", "KALRO Report Builder")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("Generate custom reports for KALRO submission", "Generate custom reports for KALRO submission")}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)] mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              {t("Date From", "Date From")}
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              {t("Date To", "Date To")}
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              {t("County", "County")}
            </label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="">{t("All Counties", "All Counties")}</option>
              {KENYA_COUNTIES.map((c) => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              {t("Animal Type", "Animal Type")}
            </label>
            <select
              value={animalType}
              onChange={(e) => setAnimalType(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="">{t("All Types", "All Types")}</option>
              {LIVESTOCK_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={generateReport}
            disabled={loading}
            className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 disabled:opacity-50 transition-colors min-h-[44px]"
          >
            {loading ? t("Generating...", "Generating...") : t("Generate Report", "Generate Report")}
          </button>
          {report && (
            <button
              onClick={exportReport}
              className="rounded-lg border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors min-h-[44px]"
            >
              {t("Export CSV", "Export CSV")}
            </button>
          )}
        </div>
      </div>

      {/* Report Results */}
      {report && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
              {t("Summary", "Summary")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: t("Total", "Total"), value: report.summary.totalAnimals, color: "text-blue-600" },
                { label: t("Healthy", "Healthy"), value: report.summary.healthy, color: "text-green-600" },
                { label: t("Sick", "Sick"), value: report.summary.sick, color: "text-red-600" },
                { label: t("Treatment", "Treatment"), value: report.summary.underTreatment, color: "text-orange-600" },
                { label: t("Recovered", "Recovered"), value: report.summary.recovered, color: "text-purple-600" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* By County */}
          {report.byCounty.length > 0 && (
            <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {t("By County", "By County")}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-[var(--color-text)]">{t("County", "County")}</th>
                      <th className="px-4 py-2 text-right font-medium text-[var(--color-text)]">{t("Total", "Total")}</th>
                      <th className="px-4 py-2 text-right font-medium text-[var(--color-text)]">{t("Healthy", "Healthy")}</th>
                      <th className="px-4 py-2 text-right font-medium text-[var(--color-text)]">{t("Sick", "Sick")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {report.byCounty.map((c) => (
                      <tr key={c.county}>
                        <td className="px-4 py-2 text-[var(--color-text)]">{c.county}</td>
                        <td className="px-4 py-2 text-right text-[var(--color-text)]">{c.count}</td>
                        <td className="px-4 py-2 text-right text-green-600">{c.healthy}</td>
                        <td className="px-4 py-2 text-right text-red-600">{c.sick}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* By Type */}
          {report.byType.length > 0 && (
            <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {t("By Animal Type", "By Animal Type")}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-[var(--color-text)]">{t("Type", "Type")}</th>
                      <th className="px-4 py-2 text-right font-medium text-[var(--color-text)]">{t("Total", "Total")}</th>
                      <th className="px-4 py-2 text-right font-medium text-[var(--color-text)]">{t("Healthy", "Healthy")}</th>
                      <th className="px-4 py-2 text-right font-medium text-[var(--color-text)]">{t("Sick", "Sick")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {report.byType.map((ty) => (
                      <tr key={ty.type}>
                        <td className="px-4 py-2 text-[var(--color-text)]">{ty.type}</td>
                        <td className="px-4 py-2 text-right text-[var(--color-text)]">{ty.count}</td>
                        <td className="px-4 py-2 text-right text-green-600">{ty.healthy}</td>
                        <td className="px-4 py-2 text-right text-red-600">{ty.sick}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-xs text-[var(--color-text-secondary)] text-right">
            {t("Generated", "Generated")}: {new Date(report.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
