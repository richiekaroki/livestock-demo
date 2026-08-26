import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";

interface Reminder {
  id: number;
  type: string;
  date: string;
  nextDueDate: string;
  batchNumber: string;
  veterinarian: string;
  animalName: string;
  animalType: string;
  owner: string;
  county: string;
}

export default function Reminders() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysAhead, setDaysAhead] = useState(7);

  const loadReminders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await backend.getVaccinationReminders(daysAhead);
      if (res.success && res.data) {
        setReminders(res.data as Reminder[]);
      }
    } finally {
      setLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return "text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/30";
    if (days <= 3) return "text-[var(--color-warning)] bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30";
    return "text-[var(--color-success)] bg-[var(--color-success)]/10 border-[var(--color-success)]/30";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t("reminders.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("reminders.desc")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <label htmlFor="reminders-show-next" className="text-sm font-medium text-[var(--color-text)]">
          {t("reminders.show_next")}:
        </label>
        <select
          id="reminders-show-next"
          value={daysAhead}
          onChange={(e) => setDaysAhead(Number(e.target.value))}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option value={3}>3 {t("days", "days")}</option>
          <option value={7}>7 {t("days", "days")}</option>
          <option value={14}>14 {t("days", "days")}</option>
          <option value={30}>30 {t("days", "days")}</option>
        </select>
        <button
          onClick={loadReminders}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 transition-colors min-h-[44px]"
        >
          {t("reminders.refresh")}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          {t("reminders.loading")}
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
          <p className="text-[var(--color-text-secondary)]">
            {t("reminders.empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => {
            const days = getDaysUntilDue(r.nextDueDate);
            const urgency = getUrgencyColor(days);
            return (
              <div
                key={r.id}
                className={`rounded-xl border p-4 flex items-center justify-between ${urgency}`}
              >
                <div className="flex-1">
                  <div className="font-medium">{r.animalName} ({r.animalType})</div>
                  <div className="text-sm opacity-75">
                    {r.type} — {r.owner}, {r.county}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    {t("reminders.vet")}: {r.veterinarian} | {t("reminders.batch")}: {r.batchNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {days === 0 ? t("reminders.today") : days === 1 ? t("reminders.tomorrow") : `${days}d`}
                  </div>
                  <div className="text-xs opacity-75">
                    {new Date(r.nextDueDate).toLocaleDateString("en-KE")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
