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
          h2 { margin: 8px 0 4px; color: #1B2E1B; }
          p { color: #3D5A3D; margin: 2px 0; }
          .tag { font-size: 12px; color: #415941; }
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
        <div className="text-center py-12 text-text-secondary">
          {t("qr.loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {t("qr.title")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t("qr.desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Animal List */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary rounded-xl shadow-sm border border-border">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-medium text-text-primary">
                {t("qr.select_animal")}
              </h2>
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {animals.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`w-full px-4 py-3 text-left hover:bg-bg-primary transition-colors min-h-[44px] ${
                    selected?.id === a.id ? "bg-accent/5" : ""
                  }`}
                >
                  <div className="font-medium text-sm text-text-primary">{a.name}</div>
                  <div className="text-xs text-text-secondary">
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
            <div className="bg-bg-secondary rounded-xl shadow-sm border border-border p-8 text-center">
              <h3 className="text-lg font-semibold text-text-primary mb-6">
                {selected.name}
              </h3>
              <img
                src={getQRUrl(selected)}
                alt={`QR Code for ${selected.name}`}
                className="mx-auto mb-6 rounded-lg border border-border"
              />
              <div className="space-y-1 mb-6 text-sm text-text-secondary">
                <p>{selected.type} — {selected.county}</p>
                <p>{t("qr.owner")}: {selected.owner}</p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handlePrint}
                   className="rounded-lg bg-accent px-6 py-2.5 min-h-[44px] text-sm font-medium text-white hover:bg-accent-hover transition-colors"
                >
                  {t("qr.print")}
                </button>
                <a
                  href={getQRUrl(selected)}
                  download={`qr-${selected.name}.png`}
                   className="rounded-lg border border-border px-6 py-2.5 min-h-[44px] text-sm font-medium text-text-primary hover:bg-bg-primary transition-colors"
                >
                  {t("qr.download")}
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-bg-secondary rounded-xl shadow-sm border border-border p-12 text-center">
              <p className="text-text-secondary">
                {t("qr.select_prompt")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
