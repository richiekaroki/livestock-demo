// src/pages/Home.tsx

import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Livestock } from "@wam-mfugo/shared";

interface HomePageProps {
  data: Livestock[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function StatsSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm animate-pulse" role="status" aria-busy="true" aria-label="Loading statistics">
      <div className="flex items-center gap-2">
        <span className="text-text-tertiary">Tracked:</span>
        <span className="w-8 h-4 bg-bg-tertiary rounded" />
        <span className="text-text-tertiary">animals</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-text-tertiary">Across:</span>
        <span className="w-4 h-4 bg-bg-tertiary rounded" />
        <span className="text-text-tertiary">counties</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-text-tertiary">Health rate:</span>
        <span className="w-8 h-4 bg-bg-tertiary rounded" />
      </div>
    </div>
  );
}

export default function HomePage({ data, loading, error, refetch }: HomePageProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    if (!data.length) return null;
    const counties = new Set<string>();
    let sick = 0;
    let healthy = 0;
    for (const a of data) {
      counties.add(a.county);
      if (a.health === "Sick") sick++;
      else if (a.health === "Healthy") healthy++;
    }
    return {
      total: data.length,
      counties: counties.size,
      sick,
      healthy,
      healthyPercent: Math.round((healthy / data.length) * 100),
    };
  }, [data]);

  return (
    <div className="bg-bg-primary text-text-primary transition-colors duration-200">
      {/* Compact Functional Hero */}
      <section aria-label="Introduction" className="border-b border-border bg-bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight tracking-tight" style={{ textWrap: "balance" }}>
              {t("home.hero_title")}
              <span className="text-accent">{t("home.hero_highlight")}</span>
            </h1>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-6" style={{ textWrap: "pretty", maxWidth: "55ch" }}>
              {t("home.hero_desc")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard?tab=overview" className="btn btn-primary">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                {t("home.open_dashboard")}
              </Link>
              <Link to="/dashboard?tab=register" className="btn btn-ghost">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                {t("home.register_animal")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section aria-label="Livestock statistics" className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {loading && !stats ? (
            <StatsSkeleton />
          ) : error ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
              <span className="text-text-secondary">
                {t("home.stats_error")}
              </span>
              <button
                onClick={() => refetch()}
                aria-label="Retry loading livestock data"
                className="text-xs text-accent hover:text-accent-hover font-medium cursor-pointer"
              >
                {t("home.stats_retry")}
              </button>
            </div>
          ) : stats ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" aria-label="Livestock statistics summary" aria-live="polite" aria-atomic="true">
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">{t("home.stats_tracked")}</span>
                <span className="font-semibold font-mono text-text-primary">
                  {stats.total.toLocaleString()}
                </span>
                <span className="text-text-tertiary">{t("home.stats_animals")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">{t("home.stats_across")}</span>
                <span className="font-semibold font-mono text-text-primary">
                  {stats.counties}
                </span>
                <span className="text-text-tertiary">{t("home.stats_counties")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">{t("home.stats_health_rate")}</span>
                <span className="font-semibold font-mono text-success">
                  {stats.healthyPercent}%
                </span>
              </div>
              {stats.sick > 0 && (
                <Link
                  to="/dashboard?tab=overview"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                  <span className="font-semibold font-mono text-error">
                    {stats.sick}
                  </span>
                  <span className="text-text-tertiary">
                    {stats.sick === 1 ? t("home.animal_needs") : t("home.animals_needs")}
                  </span>
                </Link>
              )}
            </div>
          ) : !loading && !error ? (
            <div className="text-sm text-text-secondary">
              {t("home.stats_no_data")}{" "}
              <Link to="/dashboard?tab=register" className="text-accent hover:text-accent-hover font-medium">
                {t("home.stats_register_first")}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* Feature Showcase — varied layout, not identical grid */}
      <section aria-label="Features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 tracking-tight">
            {t("home.features_title")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Feature 1: Registration — wide card */}
            <Link
              to="/dashboard?tab=register"
              className="card p-5 hover-lift group text-left sm:col-span-2"
              aria-label="Register animals — capture biometric data for cattle, goats, camels"
            >
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                    {t("home.feature_register")}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-prose">
                    {t("home.feature_register_desc")}
                  </p>
                </div>
                <svg className="w-5 h-5 text-text-tertiary group-hover:text-accent transition-colors flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Feature 2: Health Monitoring */}
            <Link
              to="/dashboard?tab=overview"
              className="card p-5 hover-lift group text-left"
              aria-label="Track health status — monitor Healthy, Sick, Treatment, and Recovered animals"
            >
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-success transition-colors">
                    {t("home.feature_health")}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {t("home.feature_health_desc")}
                  </p>
                </div>
                <svg className="w-5 h-5 text-text-tertiary group-hover:text-success transition-colors flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Feature 3: Map View */}
            <Link
              to="/map"
              className="card p-5 hover-lift group text-left"
              aria-label="See the county map — color-coded markers across 5 Kenyan counties"
            >
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center group-hover:bg-accent-gold/20 transition-colors">
                  <svg className="w-5 h-5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-accent-gold transition-colors">
                    {t("home.feature_map")}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {t("home.feature_map_desc")}
                  </p>
                </div>
                <svg className="w-5 h-5 text-text-tertiary group-hover:text-accent-gold transition-colors flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Data-Driven Closing — echoes the stats bar */}
      {stats && stats.total > 0 && (
        <section aria-label="Summary" className="py-12 px-4 bg-bg-secondary border-y border-border">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-text-secondary text-sm leading-relaxed" style={{ maxWidth: "55ch", marginInline: "auto" }}>
              {t("home.summary_from")} <strong className="text-text-primary">{stats.total.toLocaleString()}</strong> {t("home.stats_animals")}
              {t("home.summary_across")}<strong className="text-text-primary">{stats.counties}</strong> {t("home.stats_counties")},
              {" "}{t("home.stats_health_rate")}{" "}
              <strong className="text-success">{stats.healthyPercent}%</strong>{t("home.summary_health_rate")}
              {stats.sick > 0 && (
                <> <strong className="text-error">{stats.sick}</strong> {stats.sick === 1 ? t("home.animal_needs") : t("home.animals_needs")}{t("home.summary_needs_attention")}</>
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-text-tertiary" aria-hidden="true">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-cattle" /> {t("home.type_cattle")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-goat" /> {t("home.type_goats")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-sheep" /> {t("home.type_sheep")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-camel" /> {t("home.type_camels")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-pig" /> {t("home.type_pigs")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-chicken" /> {t("home.type_chickens")}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
