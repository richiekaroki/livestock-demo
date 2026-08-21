// src/pages/admin/UserList.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  county: string;
  isActive: boolean;
  createdAt: string;
}

export default function UserList() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch {
      setError(t("admin.users_load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchStatus = !statusFilter || (statusFilter === "active" ? u.isActive : !u.isActive);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleDeactivate = async (userId: number) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ isActive: false }),
      });
      loadUsers();
    } catch {
      setError(t("admin.users_update_failed"));
    }
  };

  const handleRevokeSessions = async (userId: number) => {
    try {
      await fetch(`/api/admin/users/${userId}/revoke-sessions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch {
      setError(t("admin.users_revoke_failed"));
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        {t("admin.users_title")}
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.users_search")}
          className="input-field flex-1"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field w-full sm:w-auto"
        >
          <option value="">{t("admin.users_all_roles")}</option>
          <option value="admin">{t("admin.users_admin")}</option>
          <option value="field_agent">{t("admin.users_field_agent")}</option>
          <option value="farmer">{t("admin.users_farmer")}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-full sm:w-auto"
        >
          <option value="">{t("admin.users_all_status")}</option>
          <option value="active">{t("admin.users_active")}</option>
          <option value="inactive">{t("admin.users_inactive")}</option>
        </select>
      </div>

      {loading && <p className="text-text-secondary">{t("admin.users_loading")}</p>}
      {error && <p className="text-error">{error}</p>}

      {!loading && filteredUsers.length === 0 && (
        <p className="text-text-secondary">{t("admin.users_empty")}</p>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-text-secondary">{t("admin.users_col_name")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("admin.users_col_email")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("admin.users_col_role")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("admin.users_col_county")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("admin.users_col_status")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("admin.users_col_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-bg-secondary transition-colors">
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-text-secondary">{user.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent capitalize">
                      {user.role === "admin" ? t("admin.users_admin") : user.role === "field_agent" ? t("admin.users_field_agent") : t("admin.users_farmer")}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary">{user.county}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                      {user.isActive ? t("admin.users_active") : t("admin.users_inactive")}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        className="text-xs text-error hover:text-error/80 transition-colors cursor-pointer"
                      >
                        {user.isActive ? t("admin.users_deactivate") : t("admin.users_activate")}
                      </button>
                      <button
                        onClick={() => handleRevokeSessions(user.id)}
                        className="text-xs text-warning hover:text-warning/80 transition-colors cursor-pointer"
                      >
                        {t("admin.users_revoke_sessions")}
                      </button>
                    </div>
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
