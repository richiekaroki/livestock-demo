// src/pages/admin/AuditLogs.tsx
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface AuditLog {
  id: number;
  event: string;
  email: string;
  ip: string;
  createdAt: string;
}

export default function AuditLogs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/audit-logs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch {
      setError(t("admin.audit_load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchEvent = !eventFilter || log.event === eventFilter;
      const matchEmail = !emailFilter || log.email.toLowerCase().includes(emailFilter.toLowerCase());
      return matchEvent && matchEmail;
    });
  }, [logs, eventFilter, emailFilter]);

  const eventOptions = [
    { value: "", label: t("admin.audit_all_events") },
    { value: "otp_requested", label: t("admin.audit_otp_requested") },
    { value: "otp_verified", label: t("admin.audit_otp_verified") },
    { value: "otp_failed", label: t("admin.audit_otp_failed") },
    { value: "login_success", label: t("admin.audit_login_success") },
    { value: "logout", label: t("admin.audit_logout") },
    { value: "account_created", label: t("admin.audit_account_created") },
    { value: "account_locked", label: t("admin.audit_account_locked") },
    { value: "token_refreshed", label: t("admin.audit_token_refreshed") },
    { value: "account_deactivated", label: t("admin.audit_account_deactivated") },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        {t("admin.audit_title")}
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="input-field w-full sm:w-auto"
        >
          {eventOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          placeholder={t("admin.audit_filter_email")}
          className="input-field flex-1"
        />
      </div>

      {loading && <p className="text-text-secondary">{t("admin.audit_loading")}</p>}
      {error && <p className="text-error">{error}</p>}

      {!loading && filteredLogs.length === 0 && (
        <p className="text-text-secondary">{t("admin.audit_empty")}</p>
      )}

      {!loading && filteredLogs.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-text-secondary">{t("admin.audit_col_event")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("admin.audit_col_email")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("admin.audit_col_ip")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("admin.audit_col_timestamp")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-bg-secondary transition-colors">
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">
                      {log.event}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary">{log.email}</td>
                  <td className="p-3 text-text-secondary font-mono text-xs">{log.ip}</td>
                  <td className="p-3 text-text-secondary text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
