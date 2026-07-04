// src/pages/Home.tsx

import { Link } from "react-router-dom";
import { useLiveData } from "../hooks/useLiveData";
import { useMemo } from "react";

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

export default function HomePage() {
  const { data, loading, error, refetch } = useLiveData();

  const stats = useMemo(() => {
    if (!data.length) return null;
    const counties = new Set(data.map((a) => a.county));
    const sick = data.filter((a) => a.health === "Sick").length;
    const healthy = data.filter((a) => a.health === "Healthy").length;
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
      <section className="border-b border-border bg-bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight tracking-tight" style={{ textWrap: "balance" }}>
              Livestock tracking
              <span className="text-accent"> for Kenya</span>
            </h1>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-6" style={{ textWrap: "pretty", maxWidth: "55ch" }}>
              Register animals, monitor health across counties, and sync data to
              KALRO — online or offline.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard?tab=overview" className="btn btn-primary">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                Open Dashboard
              </Link>
              <Link to="/dashboard?tab=register" className="btn btn-ghost">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Register Animal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {loading && !stats ? (
            <StatsSkeleton />
          ) : error ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
              <span className="text-text-secondary">
                Could not load data. Check your connection.
              </span>
              <button
                onClick={() => refetch()}
                aria-label="Retry loading livestock data"
                className="text-xs text-accent hover:text-accent-hover font-medium cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : stats ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" aria-label="Livestock statistics summary" aria-live="polite" aria-atomic="true">
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">Tracked:</span>
                <span className="font-semibold font-mono text-text-primary">
                  {stats.total.toLocaleString()}
                </span>
                <span className="text-text-tertiary">animals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">Across:</span>
                <span className="font-semibold font-mono text-text-primary">
                  {stats.counties}
                </span>
                <span className="text-text-tertiary">counties</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">Health rate:</span>
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
                    {stats.sick === 1 ? "animal" : "animals"} need attention
                  </span>
                </Link>
              )}
            </div>
          ) : !loading && !error ? (
            <div className="text-sm text-text-secondary">
              No animals registered yet.{" "}
              <Link to="/dashboard?tab=register" className="text-accent hover:text-accent-hover font-medium">
                Register your first animal
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* Feature Showcase — varied layout, not identical grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 tracking-tight">
            Manage your livestock
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
                    Register animals
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-prose">
                    Capture biometric data — nose prints for cattle, ear tags for
                    goats, hump patterns for camels. Each animal gets a unique
                    identity linked to its county and owner.
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
                    Track health status
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Mark animals as Healthy, Sick, Under Treatment, or Recovered.
                    Outbreak alerts trigger when 3+ animals in a county show symptoms.
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
                    See the county map
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Color-coded markers across 5 Kenyan counties. Cluster by
                    region, filter by health status, and view heatmaps.
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
        <section className="py-12 px-4 bg-bg-secondary border-y border-border">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-text-secondary text-sm leading-relaxed" style={{ maxWidth: "55ch", marginInline: "auto" }}>
              From pastoralist communities in Marsabit to dairy farms in
              Nakuru — <strong className="text-text-primary">{stats.total.toLocaleString()}</strong> animals
              across <strong className="text-text-primary">{stats.counties}</strong> counties,
              with <strong className="text-success">{stats.healthyPercent}%</strong> health rate.
              {stats.sick > 0 && (
                <> <strong className="text-error">{stats.sick}</strong> {stats.sick === 1 ? "animal needs" : "animals need"} immediate attention.</>
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-text-tertiary" aria-hidden="true">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-cattle" /> Cattle
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-goat" /> Goats
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-sheep" /> Sheep
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-camel" /> Camels
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-pig" /> Pigs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-type-chicken" /> Chickens
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
