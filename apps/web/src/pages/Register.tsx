// src/pages/Register.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCounties } from "../hooks/useCounties";
import { API_BASE } from "../config";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [demoLink, setDemoLink] = useState<string | null>(null);
  const { counties } = useCounties();
  const { t } = useTranslation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, county }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setDemoLink(data.data.inviteLink || null);
      setSubmitted(true);
    } catch {
      setError(t("auth.register_failed"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {t("auth.register_check_email_title")}
          </h1>
          <p className="text-text-secondary mb-6">
            {t("auth.register_check_email_desc")} <strong>{email}</strong>
          </p>

          {demoLink && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6">
              <p className="text-xs text-text-secondary mb-2">Demo mode — your registration link:</p>
              <a
                href={demoLink}
                className="text-sm font-mono text-accent hover:text-accent-hover break-all underline"
              >
                {demoLink}
              </a>
            </div>
          )}

          <Link to="/login" className="btn btn-primary w-full inline-block">
            {t("auth.register_go_login")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            {t("auth.register_title")}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            {t("auth.register_subtitle")}
          </p>
        </div>

        <div className="card p-5 sm:p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                {t("auth.register_name")}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("auth.register_name_placeholder")}
                autoComplete="name"
                required
                className="input-field w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                {t("auth.register_email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.register_email_placeholder")}
                required
                className="input-field w-full"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">
                {t("auth.register_phone")}
                <span className="text-text-tertiary ml-1 text-xs">{t("auth.register_optional")}</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("auth.register_phone_placeholder")}
                autoComplete="tel"
                className="input-field w-full"
              />
            </div>

            <div>
              <label htmlFor="county" className="block text-sm font-medium text-text-primary mb-1">
                {t("auth.register_county")}
              </label>
              <select
                id="county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                required
                className="input-field w-full"
              >
                <option value="">{t("auth.register_county_placeholder")}</option>
                {counties.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !name || !email || !county}
              className="btn btn-primary w-full"
            >
              {loading ? t("auth.register_submitting") : t("auth.register_submit")}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-text-secondary">
          {t("auth.register_has_account")}{" "}
          <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
            {t("auth.register_login_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
