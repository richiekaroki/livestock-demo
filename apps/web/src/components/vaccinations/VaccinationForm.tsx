import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPatch } from "../../services/apiClient";

interface VaccinationFormData {
  id: number;
  type: string;
  date: string;
  batchNumber: string;
  veterinarian: string;
  nextDueDate: string | null;
  animalId: number;
}

interface VaccinationFormProps {
  animalId?: number;
  initialData?: VaccinationFormData;
  onSaved?: () => void;
  onUpdate?: () => void;
  onCancel?: () => void;
}

interface AnimalsResponse {
  success: boolean;
  data: { id: number; name: string; type: string }[];
}

export default function VaccinationForm({ animalId, initialData, onSaved, onUpdate, onCancel }: VaccinationFormProps) {
  const isEdit = !!initialData;
  const [type, setType] = useState(initialData?.type ?? "");
  const [date, setDate] = useState(initialData?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [batchNumber, setBatchNumber] = useState(initialData?.batchNumber ?? "");
  const [veterinarian, setVeterinarian] = useState(initialData?.veterinarian ?? "");
  const [nextDueDate, setNextDueDate] = useState(initialData?.nextDueDate?.slice(0, 10) ?? "");
  const [selectedAnimalId, setSelectedAnimalId] = useState(initialData?.animalId ?? animalId ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animals, setAnimals] = useState<{ id: number; name: string; type: string }[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!animalId) {
      apiGet<AnimalsResponse>("/animals?limit=200")
        .then((data) => setAnimals(data.data || []))
        .catch(() => {});
    }
  }, [animalId]);

  const validateFields = () => {
    const errors: Record<string, string> = {};
    if (!animalId && !selectedAnimalId) errors.animal = "Please select an animal";
    if (!type.trim()) errors.type = "Vaccination type is required";
    if (!date) errors.date = "Date is required";
    if (!batchNumber.trim()) errors.batch = "Batch number is required";
    if (!veterinarian.trim()) errors.vet = "Veterinarian name is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateFields()) {
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await apiPatch(`/vaccinations/${initialData.id}`, {
          type,
          date,
          batchNumber,
          veterinarian,
          nextDueDate: nextDueDate || null,
        });
        onUpdate?.();
      } else {
        await apiPost("/vaccinations", {
          type,
          date,
          batchNumber,
          veterinarian,
          nextDueDate: nextDueDate || undefined,
          animalId: animalId || selectedAnimalId,
        });
        onSaved?.();
      }
    } catch {
      setError(isEdit ? "Failed to update vaccination record" : "Failed to save vaccination record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      {!animalId && !isEdit && (
        <div>
          <label htmlFor="vacc-animal" className="block text-sm font-medium text-text-primary mb-1">Animal</label>
          <select
            id="vacc-animal"
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(Number(e.target.value))}
            required
            className={`input-field w-full ${fieldErrors.animal ? "border-error focus:ring-error" : ""}`}
            aria-invalid={!!fieldErrors.animal}
            aria-describedby={fieldErrors.animal ? "vacc-animal-error" : undefined}
          >
            <option value="">Select animal</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
            ))}
          </select>
          {fieldErrors.animal && (
            <p id="vacc-animal-error" className="text-xs text-error mt-1">{fieldErrors.animal}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vacc-type" className="block text-sm font-medium text-text-primary mb-1">Vaccination Type</label>
          <input
            id="vacc-type"
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. FMD, Anthrax, Brucellosis"
            required
            className={`input-field w-full ${fieldErrors.type ? "border-error focus:ring-error" : ""}`}
            aria-invalid={!!fieldErrors.type}
            aria-describedby={fieldErrors.type ? "vacc-type-error" : undefined}
          />
          {fieldErrors.type && (
            <p id="vacc-type-error" className="text-xs text-error mt-1">{fieldErrors.type}</p>
          )}
        </div>
        <div>
          <label htmlFor="vacc-date" className="block text-sm font-medium text-text-primary mb-1">Date</label>
          <input
            id="vacc-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={`input-field w-full ${fieldErrors.date ? "border-error focus:ring-error" : ""}`}
            aria-invalid={!!fieldErrors.date}
            aria-describedby={fieldErrors.date ? "vacc-date-error" : undefined}
          />
          {fieldErrors.date && (
            <p id="vacc-date-error" className="text-xs text-error mt-1">{fieldErrors.date}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vacc-batch" className="block text-sm font-medium text-text-primary mb-1">Batch Number</label>
          <input
            id="vacc-batch"
            type="text"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="BATCH-2026-001"
            required
            className={`input-field w-full ${fieldErrors.batch ? "border-error focus:ring-error" : ""}`}
            aria-invalid={!!fieldErrors.batch}
            aria-describedby={fieldErrors.batch ? "vacc-batch-error" : undefined}
          />
          {fieldErrors.batch && (
            <p id="vacc-batch-error" className="text-xs text-error mt-1">{fieldErrors.batch}</p>
          )}
        </div>
        <div>
          <label htmlFor="vacc-vet" className="block text-sm font-medium text-text-primary mb-1">Veterinarian</label>
          <input
            id="vacc-vet"
            type="text"
            value={veterinarian}
            onChange={(e) => setVeterinarian(e.target.value)}
            placeholder="Dr. Kamau"
            required
            className={`input-field w-full ${fieldErrors.vet ? "border-error focus:ring-error" : ""}`}
            aria-invalid={!!fieldErrors.vet}
            aria-describedby={fieldErrors.vet ? "vacc-vet-error" : undefined}
          />
          {fieldErrors.vet && (
            <p id="vacc-vet-error" className="text-xs text-error mt-1">{fieldErrors.vet}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="vacc-next-due" className="block text-sm font-medium text-text-primary mb-1">Next Due Date (for reminder)</label>
        <input
          id="vacc-next-due"
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
          {loading ? (isEdit ? "Updating..." : "Saving...") : (isEdit ? "Update Vaccination" : "Save Vaccination")}
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
