import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";
import { LIVESTOCK_TYPES } from "@wam-mfugo/shared";

interface AssessmentResult {
  id: string;
  healthStatus: string;
  confidence: number;
  findings: {
    category: string;
    status: string;
    description: string;
    confidence: number;
  }[];
  recommendations: string[];
  assessedAt: string;
  model: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  healthy: { color: "text-green-700", bg: "bg-green-50 border-green-200", label: "Healthy" },
  sick: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Sick" },
  under_treatment: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Under Treatment" },
  needs_attention: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Needs Attention" },
};

const FINDING_STATUS: Record<string, string> = {
  normal: "text-green-600",
  warning: "text-yellow-600",
  abnormal: "text-red-600",
};

export default function HealthAssessment() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [animalType, setAnimalType] = useState("Cattle");
  const [animalName, setAnimalName] = useState("");
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleAssess = async () => {
    if (!imageUrl) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await backend.assessHealth({
        imageUrl,
        animalType,
        animalName: animalName || undefined,
        notes: notes || undefined,
      });
      if (res.success && res.data) {
        setResult(res.data as AssessmentResult);
      } else {
        setError("Assessment failed. Please try again.");
      }
    } catch {
      setError("Could not connect to assessment service.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageUrl("");
    setPreview(null);
    setResult(null);
    setError(null);
    setAnimalName("");
    setNotes("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t("Photo Health Assessment", "Photo Health Assessment")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("Upload a photo for AI-powered health analysis", "Upload a photo for AI-powered health analysis")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            {t("Upload Photo", "Upload Photo")}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t("Animal Photo", "Animal Photo")}
              </label>
              <div
                className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <div className="text-[var(--color-text-secondary)]">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p>{t("Click to upload or drag and drop", "Click to upload or drag and drop")}</p>
                    <p className="text-xs mt-1">JPG, PNG {t("up to 10MB", "up to 10MB")}</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t("Animal Type", "Animal Type")}
              </label>
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                {LIVESTOCK_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t("Animal Name (optional)", "Animal Name (optional)")}
              </label>
              <input
                type="text"
                value={animalName}
                onChange={(e) => setAnimalName(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder={t("e.g. Mwende", "e.g. Mwende")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t("Notes (optional)", "Notes (optional)")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-none"
                placeholder={t("Observed symptoms or concerns...", "Observed symptoms or concerns...")}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAssess}
                disabled={!imageUrl || loading}
                className="flex-1 rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    {t("Analyzing...", "Analyzing...")}
                  </span>
                ) : (
                  t("Assess Health", "Assess Health")
                )}
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors min-h-[44px]"
              >
                {t("Reset", "Reset")}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Status Card */}
              <div className={`rounded-xl border-2 p-6 ${STATUS_CONFIG[result.healthStatus]?.bg || "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {t("Assessment Result", "Assessment Result")}
                  </h3>
                  <span className={`text-2xl font-bold ${STATUS_CONFIG[result.healthStatus]?.color || "text-gray-700"}`}>
                    {t(STATUS_CONFIG[result.healthStatus]?.label || result.healthStatus, STATUS_CONFIG[result.healthStatus]?.label || result.healthStatus)}
                  </span>
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {t("Confidence", "Confidence")}: {Math.round(result.confidence * 100)}%
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-2 opacity-70">
                  {t("Model", "Model")}: {result.model}
                </div>
              </div>

              {/* Findings */}
              <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                  {t("Findings", "Findings")}
                </h3>
                <div className="space-y-3">
                  {result.findings.map((f, i) => (
                    <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-[var(--color-bg)]">
                      <div>
                        <div className="font-medium text-sm text-[var(--color-text)]">{f.category}</div>
                        <div className="text-sm text-[var(--color-text-secondary)]">{f.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium capitalize ${FINDING_STATUS[f.status] || "text-gray-600"}`}>
                          {f.status}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {Math.round(f.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                  {t("Recommendations", "Recommendations")}
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
                      <span className="text-[var(--color-primary)] mt-0.5">&#10003;</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="bg-[var(--color-surface)] rounded-xl p-12 shadow-sm border border-[var(--color-border)] text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-secondary)] opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-[var(--color-text-secondary)]">
                {t("Upload a photo and click Assess Health to get started", "Upload a photo and click Assess Health to get started")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
