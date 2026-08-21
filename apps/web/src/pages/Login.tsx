// src/pages/Login.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { requestOtp, verifyOtp } = useAuth();
  const { t } = useTranslation();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await requestOtp(email);
      setStep("otp");
    } catch (err) {
      setError(t("auth.login_failed"));
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
    } catch (err) {
      setError(t("auth.login_invalid_otp"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t("app.name")}
          </h1>
          <p className="text-text-secondary">
            {t("auth.login_title")}
          </p>
        </div>

        <div className="card p-6">
          {step === "email" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                  {t("auth.login_email")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field w-full"
                />
              </div>

              {error && (
                <p className="text-sm text-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="btn btn-primary w-full"
              >
                {loading ? t("auth.login_sending") : t("auth.login_send_otp")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-text-primary mb-1">
                  {t("auth.login_verify_title")}
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="input-field w-full text-center text-2xl tracking-[0.5em] font-mono"
                />
                <p className="text-sm text-text-secondary mt-1">
                  {t("auth.login_verify_desc")} {email}
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
                {loading ? t("auth.login_verifying") : t("auth.login_verify")}
              </button>

              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); setError(null); }}
                className="btn btn-ghost w-full"
              >
                {t("auth.login_different_email")}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-text-secondary">
          {t("auth.login_no_account")}{" "}
          <Link to="/register" className="text-accent hover:text-accent-hover font-medium">
            {t("auth.login_register_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
