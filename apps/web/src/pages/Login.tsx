// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const { requestOtp, verifyOtp } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await requestOtp(email);
      // Dev auto-verify: skip OTP step, user is immediately logged in
      if (res.autoVerified) {
        navigate("/");
        return;
      }
      setDemoOtp(res.otp || null);
      setStep("otp");
    } catch {
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
      navigate("/");
    } catch {
      setError(t("auth.login_invalid_otp"));
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoOtp = () => {
    if (demoOtp) setOtp(demoOtp);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            {t("app.name")}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            {t("auth.login_title")}
          </p>
        </div>

        <div className="card p-5 sm:p-6">
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
              {demoOtp && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
                  <p className="text-xs text-text-secondary mb-1">Demo mode — your OTP:</p>
                  <button
                    type="button"
                    onClick={handleUseDemoOtp}
                    className="text-2xl font-mono font-bold tracking-[0.3em] text-accent hover:text-accent-hover cursor-pointer transition-colors min-h-[44px] min-w-[44px]"
                    title="Click to auto-fill"
                  >
                    {demoOtp}
                  </button>
                </div>
              )}

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-text-primary mb-1">
                  {t("auth.login_verify_title")}
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
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
                onClick={() => { setStep("email"); setOtp(""); setError(null); setDemoOtp(null); }}
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
