import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { backend } from "../services/backend";
import type { Livestock } from "@wam-mfugo/shared";

interface WeightRecord {
  id: number;
  animalId: number;
  animalName: string;
  animalType: string;
  weight: number;
  unit: string;
  recordedAt: string;
  recordedBy: string;
  notes: string | null;
  county: string;
}

interface WeightGainStat {
  animalId: number;
  animalName: string;
  animalType: string;
  county: string;
  firstWeight: number;
  latestWeight: number;
  gain: number;
  gainPercent: number;
  recordCount: number;
  firstRecorded: string;
  lastRecorded: string;
  unit: string;
}

export default function WeightGainAnalytics() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<WeightGainStat[]>([]);
  const [history, setHistory] = useState<WeightRecord[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [showRecord, setShowRecord] = useState(false);
  const [form, setForm] = useState({ animalId: "", weight: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      backend.getWeightGainStats(),
      backend.getAnimals(),
    ]).then(([gainStats, animalsRes]) => {
      if (gainStats.success && gainStats.data) setStats(gainStats.data as WeightGainStat[]);
      if (animalsRes.success && animalsRes.data) setAnimals(animalsRes.data as Livestock[]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedAnimal) {
      backend.getAnimalWeightHistory(selectedAnimal).then((res) => {
        if (res.success && res.data) setHistory(res.data as WeightRecord[]);
      });
    }
  }, [selectedAnimal]);

  const handleRecord = async () => {
    if (!form.animalId || !form.weight) return;
    setSubmitting(true);
    try {
      await backend.recordWeight({
        animalId: Number(form.animalId),
        weight: Number(form.weight),
        recordedBy: user?.email ?? "unknown",
        notes: form.notes || undefined,
      });
      setShowRecord(false);
      setForm({ animalId: "", weight: "", notes: "" });
      const res = await backend.getWeightGainStats();
      if (res.success && res.data) setStats(res.data as WeightGainStat[]);
    } finally {
      setSubmitting(false);
    }
  };

  const getGainColor = (pct: number) => {
    if (pct >= 20) return "#16a34a";
    if (pct >= 5) return "#ca8a04";
    if (pct >= 0) return "#ea580c";
    return "#dc2626";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {t("Weight Gain Analytics", "Weight Gain Analytics")}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {t("Track animal weight over time and analyze growth rates", "Track animal weight over time and analyze growth rates")}
          </p>
        </div>
        <button
          onClick={() => setShowRecord(!showRecord)}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 transition-colors min-h-[44px]"
        >
          {t("Record Weight", "Record Weight")}
        </button>
      </div>

      {showRecord && (
        <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)] mb-8">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            {t("Record Animal Weight", "Record Animal Weight")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">{t("Animal", "Animal")}</label>
              <select
                value={form.animalId}
                onChange={(e) => setForm({ ...form, animalId: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
              >
                <option value="">{t("Select animal", "Select animal")}</option>
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">{t("Weight (kg)", "Weight (kg)")}</label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="250"
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
              onClick={handleRecord}
              disabled={submitting || !form.animalId || !form.weight}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? t("Saving...", "Saving...") : t("Save", "Save")}
            </button>
            <button
              onClick={() => setShowRecord(false)}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              {t("Cancel", "Cancel")}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--color-surface)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stats.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--color-surface)] rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
              <div className="text-sm text-[var(--color-text-secondary)]">{t("Animals Tracked", "Animals Tracked")}</div>
              <div className="text-2xl font-bold text-[var(--color-text)] mt-1">{stats.length}</div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
              <div className="text-sm text-[var(--color-text-secondary)]">{t("Avg Gain", "Avg Gain")}</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {Math.round(stats.reduce((s, g) => s + g.gainPercent, 0) / stats.length)}%
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
              <div className="text-sm text-[var(--color-text-secondary)]">{t("Top Performer", "Top Performer")}</div>
              <div className="text-lg font-bold text-[var(--color-text)] mt-1">{stats[0]?.animalName}</div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {t("Weight Gain by Animal", "Weight Gain by Animal")}
            </h2>
            {stats.map((s) => (
              <div
                key={s.animalId}
                className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                onClick={() => setSelectedAnimal(selectedAnimal === s.animalId ? null : s.animalId)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-[var(--color-text)]">{s.animalName}</span>
                    <span className="text-sm text-[var(--color-text-secondary)] ml-2">({s.animalType})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold" style={{ color: getGainColor(s.gainPercent) }}>
                      {s.gainPercent >= 0 ? "+" : ""}{s.gainPercent}%
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                      {s.firstWeight}{s.unit} &rarr; {s.latestWeight}{s.unit}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[var(--color-border)] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: ${Math.min(100, Math.max(5, Math.abs(s.gainPercent)))}%,
                      backgroundColor: getGainColor(s.gainPercent),
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
                  <span>{s.recordCount} {t("records", "records")}</span>
                  <span>{s.county}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedAnimal && history.length > 0 && (
            <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text)] mb-4">
                {t("Weight History", "Weight History")} - {history[0]?.animalName}
              </h3>
              <div className="overflow-x-auto">
                <div className="flex items-end gap-1" style={{ minHeight: 200 }}>
                  {history.map((r, i) => {
                    const maxW = Math.max(...history.map((h) => h.weight));
                    const minW = Math.min(...history.map((h) => h.weight));
                    const range = maxW - minW || 1;
                    const height = ((r.weight - minW) / range) * 150 + 30;
                    return (
                      <div key={r.id} className="flex flex-col items-center gap-1 min-w-[40px]">
                        <span className="text-xs text-[var(--color-text-secondary)]">{r.weight}</span>
                        <div
                          className="w-8 rounded-t bg-[var(--color-primary)]"
                          style={{ height: ${height}px }}
                        />
                        <span className="text-[10px] text-[var(--color-text-secondary)]">
                          {new Date(r.recordedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          {t("No weight data recorded yet. Click Record Weight to start tracking.", "No weight data recorded yet. Click Record Weight to start tracking.")}
        </div>
      )}
    </div>
  );
}
