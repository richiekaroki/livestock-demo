import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { backend } from "../services/backend";

interface MortalityRecord {
  id: number;
  animalId: number;
  animalName: string;
  animalType: string;
  cause: string;
  diseaseName: string | null;
  reportedBy: string;
  reportedAt: string;
  notes: string | null;
  county: string;
  owner: string;
}

interface MortalityStats {
  total: number;
  recentCount: number;
  byCause: { cause: string; count: number }[];
  byCounty: { county: string; count: number }[];
}

export default function MortalityTracking() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [records, setRecords] = useState<MortalityRecord[]>([]);
  const [stats, setStats] = useState<MortalityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [form, setForm] = useState({ animalId: "", cause: "", diseaseName: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      backend.getMortalities(),
      backend.getMortalityStats(),
    ]).then(([mortalities, mortalityStats]) => {
      if (mortalities.success && mortalities.data) setRecords(mortalities.data as MortalityRecord[]);
      if (mortalityStats.success && mortalityStats.data) setStats(mortalityStats.data as MortalityStats);
      setLoading(false);
    });
  }, []);

  const handleReport = async () => {
    if (!form.animalId || !form.cause) return;
    setSubmitting(true);
    try {
      await backend.reportMortality({
        animalId: Number(form.animalId),
        cause: form.cause,
        diseaseName: form.diseaseName || undefined,
        reportedBy: user?.email ?? "unknown",
        notes: form.notes || undefined,
      });
      setShowReport(false);
      setForm({ animalId: "", cause: "", diseaseName: "", notes: "" });
      const [mortalities, mortalityStats] = await Promise.all([
        backend.getMortalities(),
        backend.getMortalityStats(),
      ]);
      if (mortalities.success && mortalities.data) setRecords(mortalities.data as MortalityRecord[]);
      if (mortalityStats.success && mortalityStats.data) setStats(mortalityStats.data as MortalityStats);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {t("Mortality Tracking", "Mortality Tracking")}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {t("Track and analyze animal mortality data", "Track and analyze animal mortality data")}
          </p>
        </div>
        <button
          onClick={() => setShowReport(!showReport)}
          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors min-h-[44px]"
        >
          {t("Report Mortality", "Report Mortality")}
        </button>
      </div>

      {showReport && (
        <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)] mb-8">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            {t("Report Animal Mortality", "Report Animal Mortality")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">{t("Animal ID", "Animal ID")}</label>
              <input
                type="number"
                value={form.animalId}
                onChange={(e) => setForm({ ...form, animalId: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">{t("Cause", "Cause")}</label>
              <select
                value={form.cause}
                onChange={(e) => setForm({ ...form, cause: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
              >
                <option value="">{t("Select cause", "Select cause")}</option>
                <option value="disease">{t("Disease", "Disease")}</option>
                <option value="predation">{t("Predation", "Predation")}</option>
                <option value="accident">{t("Accident", "Accident")}</option>
                <option value="old_age">{t("Old Age", "Old Age")}</option>
                <option value="malnutrition">{t("Malnutrition", "Malnutrition")}</option>
                <option value="poisoning">{t("Poisoning", "Poisoning")}</option>
                <option value="other">{t("Other", "Other")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">{t("Disease Name (optional)", "Disease Name (optional)")}</label>
              <input
                type="text"
                value={form.diseaseName}
                onChange={(e) => setForm({ ...form, diseaseName: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="e.g. FMD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">{t("Notes (optional)", "Notes (optional)")}</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleReport}
              disabled={submitting || !form.animalId || !form.cause}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? t("Submitting...", "Submitting...") : t("Submit Report", "Submit Report")}
            </button>
            <button
              onClick={() => setShowReport(false)}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              {t("Cancel", "Cancel")}
            </button>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-secondary)]">{t("Total", "Total")}</div>
            <div className="text-2xl font-bold text-[var(--color-text)]">{stats.total}</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-secondary)]">{t("Last 30 Days", "Last 30 Days")}</div>
            <div className="text-2xl font-bold text-red-600">{stats.recentCount}</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-secondary)]">{t("Top Cause", "Top Cause")}</div>
            <div className="text-lg font-bold text-[var(--color-text)] capitalize">
              {stats.byCause[0]?.cause ?? "—"}
            </div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-secondary)]">{t("Most Affected", "Most Affected")}</div>
            <div className="text-lg font-bold text-[var(--color-text)]">
              {stats.byCounty[0]?.county ?? "—"}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={r.id} className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-[var(--color-text)]">{r.animalName}</span>
                  <span className="text-sm text-[var(--color-text-secondary)] ml-2">({r.animalType})</span>
                </div>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {new Date(r.reportedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 capitalize">
                  {r.cause}
                </span>
                {r.diseaseName && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    {r.diseaseName}
                  </span>
                )}
                <span className="text-xs text-[var(--color-text-secondary)]">{r.county}</span>
              </div>
              {r.notes && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{r.notes}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          {t("No mortality records found.", "No mortality records found.")}
        </div>
      )}
    </div>
  );
}
