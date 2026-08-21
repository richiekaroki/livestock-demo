// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useCounties } from "../hooks/useCounties";

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

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setCounty(user.county || "");
      setSubCounty(user.subCounty || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        {t("profile.title")}
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            {t("profile.email")}
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="input-field w-full opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-text-tertiary mt-1">{t("profile.email_readonly")}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            {t("profile.role")}
          </label>
          <input
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
            className="input-field w-full"
          />
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
    </div>
  );
}
