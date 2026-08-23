import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";
import type { Livestock } from "@wam-mfugo/shared";

interface DashboardStats {
  totalAnimals: number;
  healthy: number;
  sick: number;
  underTreatment: number;
  recentVaccinations: number;
  upcomingReminders: number;
  pendingSync: number;
}

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAnimals, setRecentAnimals] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [animalsRes, statsRes, remindersRes] = await Promise.all([
        backend.getAnimals({ limit: 5, sort: "createdAt", order: "desc" }),
        backend.getStats(),
        backend.getVaccinationReminders(7),
      ]);

      const animals =
        animalsRes.success && animalsRes.data
          ? (animalsRes.data as Livestock[])
          : [];

      const s = statsRes.success ? (statsRes.data as Record<string, unknown>) : null;
      const reminders =
        remindersRes.success && remindersRes.data
          ? (remindersRes.data as unknown[])
          : [];

      setRecentAnimals(animals);
      setStats({
        totalAnimals: (s?.totalAnimals as number) || animals.length,
        healthy: (s?.healthyAnimals as number) || animals.filter((a) => a.health === "Healthy").length,
        sick: (s?.sickAnimals as number) || animals.filter((a) => a.health === "Sick").length,
        underTreatment: (s?.underTreatment as number) || animals.filter((a) => a.health === "Under Treatment").length,
        recentVaccinations: (s?.vaccinatedAnimals as number) || 0,
        upcomingReminders: reminders.length,
        pendingSync: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          {t("Loading dashboard...", "Loading dashboard...")}
        </div>
      </div>
    );
  }

  const cards = stats
    ? [
        { label: t("Total Animals", "Total Animals"), value: stats.totalAnimals, color: "bg-blue-500" },
        { label: t("Healthy", "Healthy"), value: stats.healthy, color: "bg-green-500" },
        { label: t("Sick", "Sick"), value: stats.sick, color: "bg-red-500" },
        { label: t("Under Treatment", "Under Treatment"), value: stats.underTreatment, color: "bg-orange-500" },
        { label: t("Upcoming Reminders", "Upcoming Reminders"), value: stats.upcomingReminders, color: "bg-purple-500" },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t("My Farm Dashboard", "My Farm Dashboard")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("Overview of your livestock and health status", "Overview of your livestock and health status")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]"
          >
            <div className={`w-3 h-3 rounded-full ${c.color} mb-2`} />
            <div className="text-2xl font-bold text-[var(--color-text)]">{c.value}</div>
            <div className="text-sm text-[var(--color-text-secondary)]">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Animals */}
      <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)]">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {t("Recent Animals", "Recent Animals")}
          </h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {recentAnimals.length === 0 ? (
            <div className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
              {t("No animals registered yet", "No animals registered yet")}
            </div>
          ) : (
            recentAnimals.map((a) => (
              <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-medium">
                    {a.name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--color-text)]">{a.name}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      {a.type} — {a.county}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    a.health === "Healthy"
                      ? "bg-green-100 text-green-800"
                      : a.health === "Sick"
                      ? "bg-red-100 text-red-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {t(a.health, a.health)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
