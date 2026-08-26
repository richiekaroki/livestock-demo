import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";

interface ImportResult {
  imported: number;
  errors: string[];
}

export default function CsvImport() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await backend.importAnimalsCsv(file);
      if (res.success && res.data) {
        setResult(res.data as ImportResult);
      } else {
        setError(res.error || t("import.import_failed_fallback", "Import failed. Please check your file and try again."));
      }
    } catch {
      setError(t("import.connection_error", "Could not connect. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t("import.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("import.desc")}
        </p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
        {/* CSV Format Info */}
        <div className="mb-6 p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text)] mb-2">
            {t("import.csv_format")}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-2">
            {t("import.csv_required")}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mb-2">
            {t("import.csv_optional")}
          </p>
          <code className="block text-xs text-[var(--color-text)] bg-[var(--color-surface)] p-2 rounded mt-2">
            name,type,county,owner,breed,health{"\n"}
            Mwende,Cattle,Nakuru,Johno,Dairy,Healthy{"\n"}
            Kip,Goat,Machakos,Mary,Breed,Healthy
          </code>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label htmlFor="import-file" className="block text-sm font-medium text-[var(--color-text)] mb-2">
            {t("import.select_file")}
          </label>
          <div
            role="button"
            tabIndex={0}
            className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
          >
            {file ? (
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{file.name}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="text-[var(--color-text-secondary)]">
                <svg className="w-10 h-10 mx-auto mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <p>{t("import.click_to_select")}</p>
              </div>
            )}
          </div>
          <input
            id="import-file"
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="flex-1 rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                {t("import.importing")}
              </span>
            ) : (
              t("import.import_btn")
            )}
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors min-h-[44px]"
          >
            {t("import.reset")}
          </button>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="mt-6 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl p-4 text-[var(--color-error)] text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-xl p-4">
            <div className="text-[var(--color-success)] font-medium">
              {t("import.import_complete")}: {result.imported} {t("import.animals_imported")}
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-xl p-4">
              <div className="text-[var(--color-warning)] font-medium mb-2">
                {result.errors.length} {t("import.errors")}
              </div>
              <ul className="text-sm text-[var(--color-warning)] space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
