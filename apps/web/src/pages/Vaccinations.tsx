import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { apiGet, apiDelete } from "../services/apiClient";
import VaccinationForm from "../components/vaccinations/VaccinationForm";

interface Vaccination {
  id: number;
  type: string;
  date: string;
  batchNumber: string;
  veterinarian: string;
  nextDueDate: string | null;
  animalId: number;
  animalName: string;
  animalType: string;
  owner: string;
  county: string;
}

interface VaccinationsResponse {
  success: boolean;
  data: Vaccination[];
}

export default function Vaccinations() {
  const { t } = useTranslation();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);

  const loadVaccinations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<VaccinationsResponse>("/vaccinations");
      setVaccinations(res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVaccinations();
  }, [loadVaccinations]);

  const handleEdit = useCallback((vaccination: Vaccination) => {
    setEditingVaccination(vaccination);
    setShowForm(false);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm(t("vaccinations.confirmDelete"))) return;
    try {
      await apiDelete(`/vaccinations/${id}`);
      loadVaccinations();
    } catch {
      // silently fail
    }
  }, [t, loadVaccinations]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{t("vaccinations.title")}</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingVaccination(null); }} className="btn btn-primary" aria-expanded={showForm}>
          {showForm || editingVaccination ? t("vaccinations.cancel") : t("vaccinations.add")}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <VaccinationForm onSaved={() => { setShowForm(false); loadVaccinations(); }} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingVaccination && (
        <div className="mb-8">
          <VaccinationForm
            initialData={{
              id: editingVaccination.id,
              type: editingVaccination.type,
              date: editingVaccination.date,
              batchNumber: editingVaccination.batchNumber,
              veterinarian: editingVaccination.veterinarian,
              nextDueDate: editingVaccination.nextDueDate,
              animalId: editingVaccination.animalId,
            }}
            onUpdate={() => { setEditingVaccination(null); loadVaccinations(); }}
            onCancel={() => setEditingVaccination(null)}
          />
        </div>
      )}

      {loading && <p className="text-text-secondary">{t("vaccinations.loading")}</p>}

      {!loading && vaccinations.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-secondary mb-4">{t("vaccinations.empty")}</p>
          <button onClick={() => { setShowForm(true); setEditingVaccination(null); }} className="btn btn-primary">
            {t("vaccinations.recordFirst")}
          </button>
        </div>
      )}

      {!loading && vaccinations.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Vaccination records</caption>
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-text-secondary">{t("vaccinations.animal")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("vaccinations.type")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("vaccinations.vaccine")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("vaccinations.date")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("vaccinations.batch")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("vaccinations.vet")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("vaccinations.nextDue")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("vaccinations.county")}</th>
                <th className="text-left p-3 font-medium text-text-secondary">{t("vaccinations.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {vaccinations.map((v) => (
                <tr key={v.id} className="border-b border-border hover:bg-bg-secondary transition-colors">
                  <td className="p-3">
                    <div>
                      <span className="font-medium">{v.animalName}</span>
                      <span className="text-text-tertiary text-xs ml-1">({v.animalType})</span>
                    </div>
                    <span className="text-text-tertiary text-xs">{v.owner}</span>
                  </td>
                  <td className="p-3 text-text-secondary">{v.animalType}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">
                      {v.type}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary text-xs">
                    {new Date(v.date).toLocaleDateString("en-KE")}
                  </td>
                  <td className="p-3 text-text-secondary font-mono text-xs">{v.batchNumber}</td>
                  <td className="p-3 text-text-secondary text-xs">{v.veterinarian}</td>
                  <td className="p-3">
                    {v.nextDueDate ? (
                      <span className={`text-xs font-medium ${new Date(v.nextDueDate) < new Date() ? "text-error" : "text-success"}`}>
                        {new Date(v.nextDueDate).toLocaleDateString("en-KE")}
                      </span>
                    ) : (
                      <span className="text-text-tertiary text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3 text-text-secondary text-xs">{v.county}</td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(v)}
                        className="text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        {t("vaccinations.edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-xs text-error hover:text-error/80 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        {t("vaccinations.delete")}
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
