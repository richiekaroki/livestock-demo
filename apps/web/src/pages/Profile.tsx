// src/pages/Profile.tsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useCounties } from "../hooks/useCounties";
import { remoteApi } from "../services/remoteApi";
import type { SessionInfo } from "@wam-mfugo/shared";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { counties } = useCounties();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Session management state
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  // Notification permission state
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setCounty(user.county || "");
      setSubCounty(user.subCounty || "");
    }
  }, [user]);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const res = await remoteApi.getSessions();
      if (res.success && res.data) {
        setSessions(res.data);
      }
    } catch {
      setSessionsError("Failed to load sessions.");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRevokeSession = useCallback(async (sessionId: number) => {
    setRevokingId(sessionId);
    try {
      await remoteApi.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      setSessionsError("Failed to revoke session.");
    } finally {
      setRevokingId(null);
    }
  }, []);

  const handleRevokeAll = useCallback(async () => {
    setRevokingAll(true);
    setSessionsError(null);
    try {
      await remoteApi.revokeAllSessions();
      setSessions([]);
    } catch {
      setSessionsError("Failed to revoke all sessions.");
    } finally {
      setRevokingAll(false);
    }
  }, []);

  const handleToggleNotifications = useCallback(async () => {
    if (!('Notification' in window)) return;
    setNotificationsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = t("profile.name_required");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMessage(null);
    try {
      await updateProfile({ name, phone, county, subCounty });
      setMessage(t("profile.update_success"));
    } catch {
      setMessage(t("profile.update_failed"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        {t("profile.title")}
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-text-primary mb-1">
            {t("profile.email")}
          </label>
          <input
            id="profile-email"
            type="email"
            value={user?.email || ""}
            disabled
            className="input-field w-full opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-text-tertiary mt-1">{t("profile.email_readonly")}</p>
        </div>

        <div>
          <label htmlFor="profile-role" className="block text-sm font-medium text-text-primary mb-1">
            {t("profile.role")}
          </label>
          <input
            id="profile-role"
            type="text"
            value={user?.role || ""}
            disabled
            className="input-field w-full opacity-60 cursor-not-allowed capitalize"
          />
          <p className="text-xs text-text-tertiary mt-1">{t("profile.role_readonly")}</p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
            {t("profile.name")}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className={`input-field w-full ${fieldErrors.name ? "border-error focus:ring-error" : ""}`}
          />
          {fieldErrors.name && (
            <p id="name-error" className="text-xs text-error mt-1">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">
            {t("profile.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("profile.phone_placeholder")}
            className="input-field w-full"
          />
        </div>

        <div>
          <label htmlFor="county" className="block text-sm font-medium text-text-primary mb-1">
            {t("profile.county")}
          </label>
          <select
            id="county"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="input-field w-full"
          >
            <option value="">{t("profile.county_placeholder")}</option>
            {counties.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subCounty" className="block text-sm font-medium text-text-primary mb-1">
            {t("profile.sub_county")}
          </label>
          <input
            id="subCounty"
            type="text"
            value={subCounty}
            onChange={(e) => setSubCounty(e.target.value)}
            placeholder={t("profile.sub_county_optional")}
            className="input-field w-full"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.includes("success") || message.includes("fanikio") ? "text-success" : "text-error"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? t("profile.saving") : t("profile.save")}
        </button>
      </form>

      {/* Active Sessions */}
      <div className="card p-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Active Sessions</h2>
          {sessions.length > 0 && (
            <button
              onClick={handleRevokeAll}
              disabled={revokingAll}
              className="btn btn-danger text-xs"
            >
              {revokingAll ? "Revoking..." : "Revoke All"}
            </button>
          )}
        </div>

        {sessionsError && (
          <p className="text-sm text-error mb-4">{sessionsError}</p>
        )}

        {sessionsLoading ? (
          <p className="text-sm text-text-secondary">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-text-tertiary">No active sessions.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg-secondary"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {session.device || "Unknown device"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-tertiary">
                    {session.ip && <span>{session.ip}</span>}
                    <span>Last active: {formatDate(session.lastActive)}</span>
                    <span>Created: {formatDate(session.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revokingId === session.id}
                  className="btn btn-ghost text-xs text-error flex-shrink-0 ml-3"
                >
                  {revokingId === session.id ? "Revoking..." : "Revoke"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      {'Notification' in window && (
        <div className="card p-6 mt-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Notifications
          </h2>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-primary">
                Push Notifications
              </p>
              <p className="text-xs text-text-tertiary">
                {notificationPermission === 'granted'
                  ? 'Enabled — you will receive health alerts and outbreak notifications.'
                  : notificationPermission === 'denied'
                    ? 'Blocked — enable in browser settings.'
                    : 'Not enabled yet.'}
              </p>
            </div>
            <button
              onClick={handleToggleNotifications}
              disabled={
                notificationsLoading ||
                notificationPermission === 'granted' ||
                notificationPermission === 'denied'
              }
              className={`btn ${
                notificationPermission === 'granted'
                  ? 'btn-primary opacity-60 cursor-not-allowed'
                  : notificationPermission === 'denied'
                    ? 'btn-ghost opacity-60 cursor-not-allowed'
                    : 'btn-primary'
              }`}
            >
              {notificationsLoading
                ? 'Requesting...'
                : notificationPermission === 'granted'
                  ? 'Enabled'
                  : notificationPermission === 'denied'
                    ? 'Blocked'
                    : 'Enable'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
