import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../../services/apiClient";

interface VaccinationFormProps {
  animalId?: number;
  onSaved?: () => void;
  onCancel?: () => void;
}

interface AnimalsResponse {
  success: boolean;
  data: { id: number; name: string; type: string }[];
}

export default function VaccinationForm({ animalId, onSaved, onCancel }: VaccinationFormProps) {
  const [type, setType] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [batchNumber, setBatchNumber] = useState("");
  const [veterinarian, setVeterinarian] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [selectedAnimalId, setSelectedAnimalId] = useState(animalId || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animals, setAnimals] = useState<{ id: number; name: string; type: string }[]>([]);

  useEffect(() => {
    if (!animalId) {
      apiGet<AnimalsResponse>("/animals?limit=200")
        .then((data) => setAnimals(data.data || []))
        .catch(() => {});
    }
  }, [animalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiPost("/vaccinations", {
        type,
        date,
        batchNumber,
        veterinarian,
        nextDueDate: nextDueDate || undefined,
        animalId: animalId || selectedAnimalId,
      });
      onSaved?.();
    } catch {
      setError("Failed to save vaccination record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      {!animalId && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Animal</label>
          <select
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(Number(e.target.value))}
            required
            className="input-field w-full"
          >
            <option value="">Select animal</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Vaccination Type</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. FMD, Anthrax, Brucellosis"
            required
            className="input-field w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="input-field w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Batch Number</label>
          <input
            type="text"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="BATCH-2026-001"
            required
            className="input-field w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Veterinarian</label>
          <input
            type="text"
            value={veterinarian}
            onChange={(e) => setVeterinarian(e.target.value)}
            placeholder="Dr. Kamau"
            required
            className="input-field w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Next Due Date (for reminder)</label>
        <input
          type="date"
          value={nextDueDate}
          onChange={(e) => setNextDueDate(e.target.value)}
          className="input-field w-full"
        />
        <p className="text-xs text-text-tertiary mt-1">Optional. Email reminder sent 3 days before this date.</p>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Saving..." : "Save Vaccination"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
