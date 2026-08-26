import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";
import type { Livestock } from "@wam-mfugo/shared";
import { LIVESTOCK_TYPES } from "@wam-mfugo/shared";

export default function BulkOperations() {
  const { t } = useTranslation();
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", health: "", county: "" });
  const [bulkAction, setBulkAction] = useState<"health" | "delete" | "export" | "">("");
  const [bulkHealth, setBulkHealth] = useState("Healthy");
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    setLoading(true);
    try {
      const res = await backend.getAnimals({ limit: 200 });
      if (res.success && res.data) {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data: Livestock[] }).data;
        setAnimals(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = animals.filter((a) => {
    if (filter.type && a.type !== filter.type) return false;
    if (filter.health && a.health !== filter.health) return false;
    if (filter.county && a.county !== filter.county) return false;
    return true;
  });

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.id)));
    }
  };

  const handleBulkAction = async () => {
    if (selected.size === 0 || !bulkAction) return;
    setExecuting(true);
    setResult(null);
    const ids = Array.from(selected);

    try {
      if (bulkAction === "health") {
        const res = await backend.bulkUpdateHealth(ids, bulkHealth);
        if (res.success && res.data) {
          setResult(`Updated ${(res.data as { updated: number }).updated} animals to ${bulkHealth}`);
          await loadAnimals();
        }
      } else if (bulkAction === "delete") {
        if (!confirm(t("bulk.delete_confirm"))) {
          setExecuting(false);
          return;
        }
        const res = await backend.bulkDelete(ids);
        if (res.success && res.data) {
          setResult(`Deleted ${(res.data as { deleted: number }).deleted} animals`);
          await loadAnimals();
        }
      } else if (bulkAction === "export") {
        backend.bulkExport(ids);
        setResult(`Exporting ${ids.length} animals...`);
      }
      setSelected(new Set());
    } catch {
      setResult(t("bulk.action_failed"));
    } finally {
      setExecuting(false);
      setBulkAction("");
    }
  };

  const counties = [...new Set(animals.map((a) => a.county))].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t("bulk.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("bulk.desc")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
          aria-label="Filter by animal type"
        >
          <option value="">{t("bulk.all_types")}</option>
          {LIVESTOCK_TYPES.map((lt) => (
            <option key={lt} value={lt}>{lt}</option>
          ))}
        </select>
        <select
          value={filter.health}
          onChange={(e) => setFilter({ ...filter, health: e.target.value })}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
          aria-label="Filter by health status"
        >
          <option value="">{t("bulk.all_health")}</option>
          <option value="Healthy">Healthy</option>
          <option value="Sick">Sick</option>
          <option value="Under Treatment">Under Treatment</option>
          <option value="Recovered">Recovered</option>
        </select>
        <select
          value={filter.county}
          onChange={(e) => setFilter({ ...filter, county: e.target.value })}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
          aria-label="Filter by county"
        >
          <option value="">{t("bulk.all_counties")}</option>
          {counties.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {selected.size} / {filtered.length} {t("bulk.selected")}
        </span>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-[var(--color-text)]">
            {selected.size} {t("bulk.animals_selected")}
          </span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value as "health" | "delete" | "export" | "")}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
            aria-label="Bulk action"
          >
            <option value="">{t("bulk.choose_action")}</option>
            <option value="health">{t("bulk.change_health")}</option>
            <option value="export">{t("bulk.export_selected")}</option>
            <option value="delete">{t("bulk.delete_selected")}</option>
          </select>
          {bulkAction === "health" && (
            <select
              value={bulkHealth}
              onChange={(e) => setBulkHealth(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
              aria-label="Health status for bulk action"
            >
              <option value="Healthy">Healthy</option>
              <option value="Sick">Sick</option>
              <option value="Under Treatment">Under Treatment</option>
              <option value="Recovered">Recovered</option>
            </select>
          )}
          <button
            onClick={handleBulkAction}
            disabled={executing || !bulkAction}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 disabled:opacity-50 transition-colors"
          >
            {executing ? t("bulk.processing") : t("bulk.execute")}
          </button>
        </div>
      )}

      {result && (
        <div className="bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-xl p-4 text-[var(--color-success)] text-sm mb-4">
          {result}
        </div>
      )}

      {/* Animal Table */}
      <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Animal list for bulk operations</caption>
          <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                  aria-label="Select all animals"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text)]">{t("bulk.name")}</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text)]">{t("bulk.type")}</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text)]">{t("bulk.health")}</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text)]">{t("bulk.county")}</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text)]">{t("bulk.owner")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">{t("bulk.loading")}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">{t("bulk.no_animals")}</td></tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className={`hover:bg-[var(--color-bg)] ${selected.has(a.id) ? "bg-[var(--color-primary)]/5" : ""}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggleSelect(a.id)}
                      className="rounded"
                      aria-label="Select animal"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{a.name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{a.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      a.health === "Healthy" ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" :
                      a.health === "Sick" ? "bg-[var(--color-error)]/10 text-[var(--color-error)]" :
                      "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                    }`}>{a.health}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{a.county}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{a.owner}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
