// src/pages/Home.tsx

import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import type { Livestock } from "@wam-mfugo/shared";

interface HomePageProps {
  data: Livestock[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export default function HomePage({ data: _data, loading: _loading, error: _error, refetch: _refetch }: HomePageProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  // Authenticated users: redirect straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-bg-primary text-text-primary">
      {/* Hero — only for visitors */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <p className="text-xs font-medium uppercase tracking-widest text-accent mb-3">
            {t("home.trust_line")}
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight tracking-tight mb-3">
            {t("home.hero_title")}
            <span className="text-accent">{t("home.hero_highlight")}</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-lg leading-relaxed mb-6 max-w-xl">
            {t("home.hero_desc")}
          </p>
          <div className="flex flex-col sm:flex-wrap gap-3">
            <Link to="/register" className="btn btn-primary w-full sm:w-auto text-center">
              {t("home.get_started")}
            </Link>
            <Link to="/login" className="btn btn-ghost w-full sm:w-auto text-center">
              {t("home.sign_in")}
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b border-border bg-bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold font-mono text-accent">5+</div>
              <div className="text-xs text-text-tertiary mt-1">{t("home.trust_counties")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-accent">6</div>
              <div className="text-xs text-text-tertiary mt-1">{t("home.trust_types")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-accent-gold">KALRO</div>
              <div className="text-xs text-text-tertiary mt-1">{t("home.trust_kalro")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-success">{t("home.trust_offline_label")}</div>
              <div className="text-xs text-text-tertiary mt-1">{t("home.trust_offline")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 sm:py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 tracking-tight">
            {t("home.how_title")}
          </h2>
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-3">
            <div className="flex flex-col">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm mb-3 shrink-0">1</div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">{t("home.step1_title")}</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{t("home.step1_desc")}</p>
            </div>
            <div className="flex flex-col">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm mb-3 shrink-0">2</div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">{t("home.step2_title")}</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{t("home.step2_desc")}</p>
            </div>
            <div className="flex flex-col">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm mb-3 shrink-0">3</div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">{t("home.step3_title")}</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{t("home.step3_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — only for visitors */}
      <section className="py-10 sm:py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">{t("home.cta_title")}</h2>
          <p className="text-text-secondary text-sm sm:text-base mb-6 max-w-md mx-auto">
            {t("home.cta_desc")}
          </p>
          <Link to="/register" className="btn btn-primary w-full sm:w-auto">
            {t("home.get_started")}
          </Link>
        </div>
      </section>
    </div>
  );
}
