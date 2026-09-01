import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch } from "../services/apiClient";

interface Outbreak {
  id: number;
  diseaseType: string;
  affectedAnimals: number;
  suspectedAnimals: number;
  county: string;
  reportedBy: string;
  reportedAt: string;
  symptoms: string[];
  actions: string[];
  status: string;
}

interface OutbreaksResponse {
  success: boolean;
  data: Outbreak[];
}

const STATUS_STYLES: Record<string, string> = {
  reported: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  investigating: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
  contained: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  resolved: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
};

export default function Outbreaks() {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [diseaseType, setDiseaseType] = useState("");
  const [affectedAnimals, setAffectedAnimals] = useState("");
  const [county, setCounty] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOutbreaks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<OutbreaksResponse>("/outbreaks");
      setOutbreaks(res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOutbreaks();
  }, [loadOutbreaks]);

  const handleReport = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseType.trim() || !affectedAnimals || !county.trim() || !reportedBy.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiPost("/outbreaks", {
        diseaseType: diseaseType.trim(),
        affectedAnimals: Number(affectedAnimals),
        county: county.trim(),
        lat: 0,
        lng: 0,
        reportedBy: reportedBy.trim(),
        symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean),
        actions: actionsTaken.split(",").map((a) => a.trim()).filter(Boolean),
      });
      setShowForm(false);
      setDiseaseType("");
      setAffectedAnimals("");
      setCounty("");
      setSymptoms("");
      setActionsTaken("");
      setReportedBy("");
      loadOutbreaks();
    } catch {
      setError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [diseaseType, affectedAnimals, county, reportedBy, symptoms, actionsTaken, loadOutbreaks]);

  const handleStatusUpdate = useCallback(async (id: number, newStatus: string) => {
    try {
      await apiPatch(`/outbreaks/${id}`, { status: newStatus });
      loadOutbreaks();
    } catch {
      // silently fail
    }
  }, [loadOutbreaks]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Disease Outbreaks</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" aria-expanded={showForm}>
          {showForm ? "Cancel" : "Report Outbreak"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleReport} className="card p-6 space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="outbreak-disease" className="block text-sm font-medium text-text-primary mb-1">Disease Type *</label>
              <input
                id="outbreak-disease"
                type="text"
                value={diseaseType}
                onChange={(e) => setDiseaseType(e.target.value)}
                placeholder="e.g. Foot and Mouth Disease"
                required
                className="input-field w-full"
              />
            </div>
            <div>
              <label htmlFor="outbreak-animals" className="block text-sm font-medium text-text-primary mb-1">Affected Animals *</label>
              <input
                id="outbreak-animals"
                type="number"
                value={affectedAnimals}
                onChange={(e) => setAffectedAnimals(e.target.value)}
                placeholder="Number of animals"
                required
                min="1"
                className="input-field w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="outbreak-county" className="block text-sm font-medium text-text-primary mb-1">County *</label>
              <input
                id="outbreak-county"
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g. Nakuru"
                required
                className="input-field w-full"
              />
            </div>
            <div>
              <label htmlFor="outbreak-reported-by" className="block text-sm font-medium text-text-primary mb-1">Reported By *</label>
              <input
                id="outbreak-reported-by"
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="Veterinarian name"
                required
                className="input-field w-full"
              />
            </div>
          </div>
          <div>
            <label htmlFor="outbreak-symptoms" className="block text-sm font-medium text-text-primary mb-1">Symptoms</label>
            <input
              id="outbreak-symptoms"
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Comma-separated, e.g. lameness, fever, blisters"
              className="input-field w-full"
            />
          </div>
          <div>
            <label htmlFor="outbreak-actions" className="block text-sm font-medium text-text-primary mb-1">Actions Taken</label>
            <input
              id="outbreak-actions"
              type="text"
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              placeholder="Comma-separated, e.g. quarantine, vaccination"
              className="input-field w-full"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Reporting..." : "Report Outbreak"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p className="text-text-secondary">Loading outbreaks...</p>}

      {!loading && outbreaks.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-secondary mb-4">No outbreaks reported yet.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Report First Outbreak
          </button>
        </div>
      )}

      {!loading && outbreaks.length > 0 && (
        <div className="space-y-4">
          {outbreaks.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">{o.diseaseType}</h2>
                  <p className="text-sm text-text-secondary">
                    {o.county} · {o.affectedAnimals} affected · Reported by {o.reportedBy}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {new Date(o.reportedAt).toLocaleDateString("en-KE")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[o.status] || "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"}`}>
                    {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                    className="input-field text-xs py-1 px-2"
                    aria-label="Change outbreak status"
                  >
                    <option value="reported">Reported</option>
                    <option value="investigating">Investigating</option>
                    <option value="contained">Contained</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              {o.symptoms.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-text-secondary">Symptoms: </span>
                  <span className="text-xs text-text-primary">{o.symptoms.join(", ")}</span>
                </div>
              )}
              {o.actions.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-text-secondary">Actions: </span>
                  <span className="text-xs text-text-primary">{o.actions.join(", ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
