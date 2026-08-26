// src/pages/VerifyInvite.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE, TOKEN_KEY, USER_KEY } from "../config";

export default function VerifyInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg(t("auth.verify_invite_invalid"));
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/verify-invite/${token}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setErrorMsg(data.message || t("auth.verify_invite_expired"));
          return;
        }

        localStorage.setItem(TOKEN_KEY, data.data.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
        navigate("/dashboard", { replace: true });
      } catch {
        setStatus("error");
        setErrorMsg(t("auth.verify_invite_network_error"));
      }
    };

    verify();
  }, [token, navigate, t]);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-accent animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p className="text-text-secondary">{t("auth.verify_invite_loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" x2="9" y1="9" y2="15" />
            <line x1="9" x2="15" y1="9" y2="15" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {t("auth.verify_invite_failed_title")}
        </h1>
        <p className="text-text-secondary mb-6">{errorMsg}</p>
        <Link to="/register" className="btn btn-primary inline-block">
          {t("auth.verify_invite_try_again")}
        </Link>
      </div>
    </div>
  );
}
