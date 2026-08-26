import { useState } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";
import { KENYA_COUNTIES, LIVESTOCK_TYPES } from "@wam-mfugo/shared";
import type { Livestock, Filters } from "@wam-mfugo/shared";

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

      const res = await backend.getAnimals(params as Filters);
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
        <h1 className="text-2xl font-bold text-text-primary">
          {t("kalro.title")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t("kalro.desc")}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="kalro-from" className="block text-sm font-medium text-text-primary mb-2">
              {t("kalro.date_from")}
            </label>
            <input
              id="kalro-from"
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="kalro-to" className="block text-sm font-medium text-text-primary mb-2">
              {t("kalro.date_to")}
            </label>
            <input
              id="kalro-to"
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="kalro-county" className="block text-sm font-medium text-text-primary mb-2">
              {t("kalro.county")}
            </label>
            <select
              id="kalro-county"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="">{t("kalro.all_counties")}</option>
              {KENYA_COUNTIES.map((c) => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="kalro-type" className="block text-sm font-medium text-text-primary mb-2">
              {t("kalro.animal_type")}
            </label>
            <select
              id="kalro-type"
              value={animalType}
              onChange={(e) => setAnimalType(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="">{t("kalro.all_types")}</option>
              {LIVESTOCK_TYPES.map((lt) => (
                <option key={lt} value={lt}>{lt}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={generateReport}
            disabled={loading}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors min-h-[44px]"
          >
            {loading ? t("kalro.generating") : t("kalro.generate")}
          </button>
          {report && (
            <button
              onClick={exportReport}
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-primary hover:bg-bg-primary transition-colors min-h-[44px]"
            >
              {t("kalro.export_csv")}
            </button>
          )}
        </div>
      </div>

      {/* Report Results */}
      {report && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {t("kalro.summary")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: t("kalro.total"), value: report.summary.totalAnimals, color: "text-info" },
                { label: t("kalro.healthy"), value: report.summary.healthy, color: "text-success" },
                { label: t("kalro.sick"), value: report.summary.sick, color: "text-error" },
                { label: t("kalro.treatment"), value: report.summary.underTreatment, color: "text-warning" },
                { label: t("kalro.recovered"), value: report.summary.recovered, color: "text-purple-600" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-text-secondary">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* By County */}
          {report.byCounty.length > 0 && (
            <div className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                {t("kalro.by_county")}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Report breakdown</caption>
                  <thead className="border-b border-border">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-text-primary">{t("kalro.county")}</th>
                      <th className="px-4 py-2 text-right font-medium text-text-primary">{t("kalro.total")}</th>
                      <th className="px-4 py-2 text-right font-medium text-text-primary">{t("kalro.healthy")}</th>
                      <th className="px-4 py-2 text-right font-medium text-text-primary">{t("kalro.sick")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.byCounty.map((c) => (
                      <tr key={c.county}>
                        <td className="px-4 py-2 text-text-primary">{c.county}</td>
                        <td className="px-4 py-2 text-right text-text-primary">{c.count}</td>
                        <td className="px-4 py-2 text-right text-success">{c.healthy}</td>
                        <td className="px-4 py-2 text-right text-error">{c.sick}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* By Type */}
          {report.byType.length > 0 && (
            <div className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                {t("kalro.by_type")}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Report breakdown</caption>
                  <thead className="border-b border-border">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-text-primary">{t("kalro.type")}</th>
                      <th className="px-4 py-2 text-right font-medium text-text-primary">{t("kalro.total")}</th>
                      <th className="px-4 py-2 text-right font-medium text-text-primary">{t("kalro.healthy")}</th>
                      <th className="px-4 py-2 text-right font-medium text-text-primary">{t("kalro.sick")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.byType.map((ty) => (
                      <tr key={ty.type}>
                        <td className="px-4 py-2 text-text-primary">{ty.type}</td>
                        <td className="px-4 py-2 text-right text-text-primary">{ty.count}</td>
                        <td className="px-4 py-2 text-right text-success">{ty.healthy}</td>
                        <td className="px-4 py-2 text-right text-error">{ty.sick}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-xs text-text-secondary text-right">
            {t("kalro.generated")}: {new Date(report.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
