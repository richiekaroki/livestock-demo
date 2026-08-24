import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../services/backend";
import type { Livestock } from "@wam-mfugo/shared";

export default function AnimalQR() {
  const { t } = useTranslation();
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [selected, setSelected] = useState<Livestock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    setLoading(true);
    try {
      const res = await backend.getAnimals({ limit: 100 });
      if (res.success && res.data) {
        const data = Array.isArray(res.data) ? res.data : (res.data as { data: Livestock[] }).data;
        setAnimals(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const getQRUrl = (animal: Livestock) => {
    const baseUrl = window.location.origin;
    const animalUrl = `${baseUrl}/animals/${animal.id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(animalUrl)}&bgcolor=ffffff&color=166534&margin=10`;
  };

  const handlePrint = () => {
    if (!selected) return;
    const qrUrl = getQRUrl(selected);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>QR - ${selected.name}</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
          img { width: 200px; height: 200px; }
          h2 { margin: 8px 0 4px; }
          p { color: #666; margin: 2px 0; }
          .tag { font-size: 12px; color: #999; }
        </style>
        </head>
        <body>
          <img src="${qrUrl}" alt="QR Code" />
          <h2>${selected.name}</h2>
          <p>${selected.type} — ${selected.county}</p>
          <p class="tag">ID: ${selected.id}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          {t("Loading animals...", "Loading animals...")}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t("Animal QR Codes", "Animal QR Codes")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("Generate QR codes linking to animal profiles", "Generate QR codes linking to animal profiles")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Animal List */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)]">
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <h2 className="font-medium text-[var(--color-text)]">
                {t("Select Animal", "Select Animal")}
              </h2>
            </div>
            <div className="divide-y divide-[var(--color-border)] max-h-[500px] overflow-y-auto">
              {animals.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`w-full px-4 py-3 text-left hover:bg-[var(--color-bg)] transition-colors ${
                    selected?.id === a.id ? "bg-[var(--color-primary)]/5" : ""
                  }`}
                >
                  <div className="font-medium text-sm text-[var(--color-text)]">{a.name}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {a.type} — {a.county}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* QR Preview */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] p-8 text-center">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6">
                {selected.name}
              </h3>
              <img
                src={getQRUrl(selected)}
                alt={`QR Code for ${selected.name}`}
                className="mx-auto mb-6 rounded-lg border border-[var(--color-border)]"
              />
              <div className="space-y-1 mb-6 text-sm text-[var(--color-text-secondary)]">
                <p>{selected.type} — {selected.county}</p>
                <p>{t("Owner", "Owner")}: {selected.owner}</p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handlePrint}
                  className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 transition-colors"
                >
                  {t("Print QR Code", "Print QR Code")}
                </button>
                <a
                  href={getQRUrl(selected)}
                  download={`qr-${selected.name}.png`}
                  className="rounded-lg border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  {t("Download", "Download")}
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] p-12 text-center">
              <p className="text-[var(--color-text-secondary)]">
                {t("Select an animal to generate its QR code", "Select an animal to generate its QR code")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
