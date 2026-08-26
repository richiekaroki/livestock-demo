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
  healthy: { color: "text-success", bg: "bg-success/10 border-success/30", label: "Healthy" },
  sick: { color: "text-error", bg: "bg-error/10 border-error/30", label: "Sick" },
  under_treatment: { color: "text-warning", bg: "bg-warning/10 border-warning/30", label: "Under Treatment" },
  needs_attention: { color: "text-warning", bg: "bg-warning/10 border-warning/30", label: "Needs Attention" },
};

const FINDING_STATUS: Record<string, string> = {
  normal: "text-success",
  warning: "text-warning",
  abnormal: "text-error",
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
      setError("Could not connect. Please try again.");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          {t("assessment.title")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t("assessment.desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Upload Form */}
        <div className="bg-bg-secondary rounded-xl p-5 sm:p-6 shadow-sm border border-border">
          <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-4">
            {t("assessment.upload_photo")}
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="assessment-photo" className="block text-sm font-medium text-text-primary mb-2">
                {t("assessment.animal_photo")}
              </label>
              <div
                role="button"
                tabIndex={0}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <div className="text-text-secondary">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p>{t("assessment.click_upload")}</p>
                    <p className="text-xs mt-1">JPG, PNG {t("assessment.up_to")}</p>
                  </div>
                )}
              </div>
              <input
                id="assessment-photo"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div>
              <label htmlFor="assessment-type" className="block text-sm font-medium text-text-primary mb-2">
                {t("assessment.animal_type")}
              </label>
              <select
                id="assessment-type"
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {LIVESTOCK_TYPES.map((lt) => (
                  <option key={lt} value={lt}>{lt}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assessment-name" className="block text-sm font-medium text-text-primary mb-2">
                {t("assessment.animal_name")}
              </label>
              <input
                id="assessment-name"
                type="text"
                value={animalName}
                onChange={(e) => setAnimalName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder={t("assessment.animal_name_placeholder")}
              />
            </div>

            <div>
              <label htmlFor="assessment-notes" className="block text-sm font-medium text-text-primary mb-2">
                {t("assessment.notes")}
              </label>
              <textarea
                id="assessment-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                placeholder={t("assessment.notes_placeholder")}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAssess}
                disabled={!imageUrl || loading}
                className="flex-1 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    {t("assessment.analyzing")}
                  </span>
                ) : (
                  t("assessment.assess_health")
                )}
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-primary hover:bg-bg-primary transition-colors min-h-[48px]"
              >
                {t("assessment.reset")}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {error && (
            <div className="bg-error/10 border border-error/30 rounded-xl p-4 text-error text-sm mb-6">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Status Card */}
              <div className={`rounded-xl border-2 p-6 ${STATUS_CONFIG[result.healthStatus]?.bg || "bg-bg-primary border-border"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {t("assessment.result")}
                  </h3>
                  <span className={`text-2xl font-bold ${STATUS_CONFIG[result.healthStatus]?.color || "text-text-secondary"}`}>
                    {t(STATUS_CONFIG[result.healthStatus]?.label || result.healthStatus, STATUS_CONFIG[result.healthStatus]?.label || result.healthStatus)}
                  </span>
                </div>
                <div className="text-sm text-text-secondary">
                  {t("assessment.confidence")}: {Math.round(result.confidence * 100)}%
                </div>
                <div className="text-xs text-text-secondary mt-2 opacity-70">
                  {t("assessment.ai_powered")}
                </div>
              </div>

              {/* Findings */}
              <div className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  {t("assessment.findings")}
                </h3>
                <div className="space-y-3">
                  {result.findings.map((f, i) => (
                    <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-bg-primary">
                      <div>
                        <div className="font-medium text-sm text-text-primary">{f.category}</div>
                        <div className="text-sm text-text-secondary">{f.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium capitalize ${FINDING_STATUS[f.status] || "text-text-secondary"}`}>
                          {f.status}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {Math.round(f.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  {t("assessment.recommendations")}
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                      <span className="text-accent mt-0.5">&#10003;</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="bg-bg-secondary rounded-xl p-12 shadow-sm border border-border text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-text-secondary">
                {t("assessment.upload_prompt")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
