// src/pages/Register.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useCounties } from "../hooks/useCounties";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, verifyOtp } = useAuth();
  const { counties } = useCounties();
  const { t } = useTranslation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ name, email, phone, county });
      setStep("otp");
    } catch {
      setError(t("auth.register_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(email, otp);
    } catch {
      setError(t("auth.register_verify_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t("auth.register_title")}
          </h1>
          <p className="text-text-secondary">
            {t("auth.register_subtitle")}
          </p>
        </div>

        <div className="card p-6">
          {step === "form" ? (
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
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("auth.register_phone_placeholder")}
                  required
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
                disabled={loading || !name || !email || !phone || !county}
                className="btn btn-primary w-full"
              >
                {loading ? t("auth.register_submitting") : t("auth.register_submit")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-text-primary mb-1">
                  {t("auth.register_verify_title")}
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder={t("auth.register_verify_placeholder")}
                  maxLength={6}
                  required
                  className="input-field w-full text-center text-2xl tracking-[0.5em] font-mono"
                />
                <p className="text-sm text-text-secondary mt-1">
                  {t("auth.register_verify_desc")} {email}
                </p>
              </div>

              {error && (
                <p className="text-sm text-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn btn-primary w-full"
              >
                {loading ? t("auth.register_verifying") : t("auth.register_verify")}
              </button>

              <button
                type="button"
                onClick={() => { setStep("form"); setOtp(""); setError(null); }}
                className="btn btn-ghost w-full"
              >
                {t("auth.register_back")}
              </button>
            </form>
          )}
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
