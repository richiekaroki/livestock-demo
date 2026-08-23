import { useState, useEffect } from "react";
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
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);

  useEffect(() => {
    loadVaccinations();
  }, []);

  const loadVaccinations = async () => {
    setLoading(true);
    try {
      const res = await apiGet<VaccinationsResponse>("/vaccinations");
      setVaccinations(res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vaccination: Vaccination) => {
    setEditingVaccination(vaccination);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this vaccination record?")) return;
    try {
      await apiDelete(`/vaccinations/${id}`);
      loadVaccinations();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Vaccination Records</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingVaccination(null); }} className="btn btn-primary" aria-expanded={showForm}>
          {showForm || editingVaccination ? "Cancel" : "Add Vaccination"}
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

      {loading && <p className="text-text-secondary">Loading vaccination records...</p>}

      {!loading && vaccinations.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-secondary mb-4">No vaccination records yet.</p>
          <button onClick={() => { setShowForm(true); setEditingVaccination(null); }} className="btn btn-primary">
            Record First Vaccination
          </button>
        </div>
      )}

      {!loading && vaccinations.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-text-secondary">Animal</th>
                <th className="text-left p-3 font-medium text-text-secondary">Type</th>
                <th className="text-left p-3 font-medium text-text-secondary">Vaccine</th>
                <th className="text-left p-3 font-medium text-text-secondary">Date</th>
                <th className="text-left p-3 font-medium text-text-secondary">Batch</th>
                <th className="text-left p-3 font-medium text-text-secondary">Vet</th>
                <th className="text-left p-3 font-medium text-text-secondary">Next Due</th>
                <th className="text-left p-3 font-medium text-text-secondary">County</th>
                <th className="text-left p-3 font-medium text-text-secondary">Actions</th>
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
                        className="text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-xs text-error hover:text-error/80 transition-colors cursor-pointer"
                      >
                        Delete
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
