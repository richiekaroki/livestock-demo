import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { backend } from "../services/backend";
import type { AnimalStats, Livestock } from "@wam-mfugo/shared";

interface DashboardStats {
  totalAnimals: number;
  healthy: number;
  sick: number;
  underTreatment: number;
  recentVaccinations: number;
  upcomingReminders: number;
  pendingSync: number;
}

const HEALTH_KEY_MAP: Record<string, string> = {
  Healthy: "health.healthy",
  Sick: "health.sick",
  "Under Treatment": "health.under_treatment",
  Recovered: "health.recovered",
};

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAnimals, setRecentAnimals] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [animalsRes, statsRes, remindersRes] = await Promise.all([
        backend.getAnimals({ limit: 5, sort: "createdAt", order: "desc" }),
        backend.getAnimalStatistics(),
        backend.getVaccinationReminders(7),
      ]);

      const animals =
        animalsRes.success && animalsRes.data
          ? (animalsRes.data as Livestock[])
          : [];

      const s = statsRes.success ? (statsRes.data as AnimalStats) : null;
      const reminders =
        remindersRes.success && remindersRes.data
          ? (remindersRes.data as unknown[])
          : [];

      setRecentAnimals(animals);
      setStats({
        totalAnimals: s?.totalAnimals ?? animals.length,
        healthy: s?.healthyCount ?? animals.filter((a) => a.health === "Healthy").length,
        sick: s?.sickCount ?? animals.filter((a) => a.health === "Sick").length,
        underTreatment: s?.underTreatmentCount ?? animals.filter((a) => a.health === "Under Treatment").length,
        recentVaccinations: 0,
        upcomingReminders: reminders.length,
        pendingSync: 0,
      });
    } catch {
      setError(t("farmer.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-text-secondary">
          {t("farmer.loading")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-error mb-4">{error}</p>
          <button onClick={loadDashboard} className="btn btn-primary text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const cards = stats
    ? [
        { label: t("farmer.total"), value: stats.totalAnimals, color: "bg-info" },
        { label: t("farmer.healthy"), value: stats.healthy, color: "bg-success" },
        { label: t("farmer.sick"), value: stats.sick, color: "bg-error" },
        { label: t("farmer.treatment"), value: stats.underTreatment, color: "bg-warning" },
        { label: t("farmer.upcoming"), value: stats.upcomingReminders, color: "bg-info" },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {t("farmer.title")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t("farmer.desc")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-bg-secondary rounded-xl p-4 shadow-sm border border-border"
          >
            <div className={`w-3 h-3 rounded-full ${c.color} mb-2`} />
            <div className="text-2xl font-bold text-text-primary">{c.value}</div>
            <div className="text-sm text-text-secondary">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Animals */}
      <div className="bg-bg-secondary rounded-xl shadow-sm border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            {t("farmer.recent")}
          </h2>
        </div>
        <div className="divide-y divide-border">
          {recentAnimals.length === 0 ? (
            <div className="px-6 py-8 text-center text-text-secondary">
              <p className="mb-4">{t("farmer.empty")}</p>
              <Link to="/dashboard" className="btn btn-primary text-sm">
                {t("farmer.registerFirst")}
              </Link>
            </div>
          ) : (
            recentAnimals.map((a) => (
              <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium">
                    {a.name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">{a.name}</div>
                    <div className="text-sm text-text-secondary">
                      {a.type} — {a.county}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    a.health === "Healthy"
                      ? "bg-success/10 text-success"
                      : a.health === "Sick"
                      ? "bg-error/10 text-error"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {t(HEALTH_KEY_MAP[a.health] || a.health, a.health)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
