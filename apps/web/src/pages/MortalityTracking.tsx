import { useState, useEffect, useCallback } from "react";
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

  const loadData = useCallback(async () => {
    const [mortalities, mortalityStats] = await Promise.all([
      backend.getMortalities(),
      backend.getMortalityStats(),
    ]);
    if (mortalities.success && mortalities.data) setRecords(mortalities.data as MortalityRecord[]);
    if (mortalityStats.success && mortalityStats.data) setStats(mortalityStats.data as MortalityStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReport = useCallback(async () => {
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
      await loadData();
    } finally {
      setSubmitting(false);
    }
  }, [form, user, loadData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {t("mortality.title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {t("mortality.desc")}
          </p>
        </div>
        <button
          onClick={() => setShowReport(!showReport)}
          className="rounded-lg bg-[var(--color-error)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-error)]/80 transition-colors min-h-[44px]"
        >
          {t("mortality.report")}
        </button>
      </div>

      {showReport && (
        <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)] mb-8">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            {t("mortality.report_title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mortality-animal-id" className="block text-sm font-medium text-[var(--color-text)] mb-1">{t("mortality.animal_id")}</label>
              <input
                id="mortality-animal-id"
                type="number"
                value={form.animalId}
                onChange={(e) => setForm({ ...form, animalId: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="1"
              />
            </div>
            <div>
              <label htmlFor="mortality-cause" className="block text-sm font-medium text-[var(--color-text)] mb-1">{t("mortality.cause")}</label>
              <select
                id="mortality-cause"
                value={form.cause}
                onChange={(e) => setForm({ ...form, cause: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
              >
                <option value="">{t("mortality.select_cause")}</option>
                <option value="disease">{t("mortality.disease")}</option>
                <option value="predation">{t("mortality.predation")}</option>
                <option value="accident">{t("mortality.accident")}</option>
                <option value="old_age">{t("mortality.old_age")}</option>
                <option value="malnutrition">{t("mortality.malnutrition")}</option>
                <option value="poisoning">{t("mortality.poisoning")}</option>
                <option value="other">{t("mortality.other")}</option>
              </select>
            </div>
            <div>
              <label htmlFor="mortality-disease" className="block text-sm font-medium text-[var(--color-text)] mb-1">{t("mortality.disease_name")}</label>
              <input
                id="mortality-disease"
                type="text"
                value={form.diseaseName}
                onChange={(e) => setForm({ ...form, diseaseName: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="e.g. FMD"
              />
            </div>
            <div>
              <label htmlFor="mortality-notes" className="block text-sm font-medium text-[var(--color-text)] mb-1">{t("mortality.notes")}</label>
              <input
                id="mortality-notes"
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
               className="rounded-lg bg-[var(--color-error)] px-4 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-[var(--color-error)]/80 disabled:opacity-50 transition-colors"
            >
              {submitting ? t("mortality.submitting") : t("mortality.submit_report")}
            </button>
            <button
              onClick={() => setShowReport(false)}
               className="rounded-lg border border-[var(--color-border)] px-4 py-2 min-h-[44px] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              {t("mortality.cancel")}
            </button>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-secondary)]">{t("mortality.total")}</div>
            <div className="text-2xl font-bold text-[var(--color-text)]">{stats.total}</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-secondary)]">{t("mortality.last_30_days")}</div>
            <div className="text-2xl font-bold text-[var(--color-error)]">{stats.recentCount}</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-secondary)]">{t("mortality.top_cause")}</div>
            <div className="text-lg font-bold text-[var(--color-text)] capitalize">
              {stats.byCause[0]?.cause ?? "—"}
            </div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-secondary)]">{t("mortality.most_affected")}</div>
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
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-error)]/10 text-[var(--color-error)] capitalize">
                  {r.cause}
                </span>
                {r.diseaseName && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
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
          {t("mortality.no_records")}
        </div>
      )}
    </div>
  );
}
