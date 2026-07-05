// src/components/export/ExportButton.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import type { Livestock } from "../../types";
import { healthColors } from "../../utils/constants";

interface ExportButtonProps {
  data: Livestock[];
  filename?: string;
}

export default function ExportButton({
  data,
  filename = "livestock-data",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setShowMenu(false), []);

  useEffect(() => {
    if (!showMenu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showMenu, closeMenu]);

  const exportToCSV = () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const headers = [
        "ID", "Name", "Type", "Health Status", "County", "Owner",
        "Latitude", "Longitude", "Registration Date",
      ];

      const rows = data.map((animal) => [
        animal.id, animal.name, animal.type, animal.health,
        animal.county, animal.owner, animal.lat, animal.lng,
        animal.createdAt || new Date().toISOString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("CSV export failed:", error);
      setExportError("CSV export failed. Please try again.");
      setTimeout(() => setExportError(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setExportError("Please allow popups to generate PDF");
        setTimeout(() => setExportError(null), 4000);
        setIsExporting(false);
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Livestock Report - ${filename}</title>
          <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Fira Sans', sans-serif; padding: 40px; background: white; color: #1B2E1B; }
            .header { text-align: center; border-bottom: 3px solid #15803D; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 28px; color: #1B2E1B; margin-bottom: 10px; }
            .header p { color: #6B8A6B; font-size: 14px; }
            .summary { background: #F0FDF4; padding: 20px; border-radius: 12px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .summary-item { text-align: center; }
            .summary-item .value { font-size: 32px; font-weight: bold; color: #15803D; font-family: 'Fira Code', monospace; }
            .summary-item .label { font-size: 14px; color: #6B8A6B; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #1B2E1B; color: white; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
            td { padding: 10px 12px; border-bottom: 1px solid #C8E6C9; font-size: 13px; }
            tr:nth-child(even) { background: #F0FDF4; }
            .health-healthy { color: ${healthColors.Healthy}; font-weight: bold; }
            .health-sick { color: ${healthColors.Sick}; font-weight: bold; }
            .health-treatment { color: ${healthColors["Under Treatment"]}; font-weight: bold; }
            .health-recovered { color: ${healthColors.Recovered}; font-weight: bold; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #C8E6C9; text-align: center; font-size: 12px; color: #6B8A6B; }
            @media print { body { padding: 20px; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Livestock Management Report</h1>
            <p>Generated on ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</p>
            <p style="margin-top: 5px; font-weight: bold;">Livestock Tracker System - Kenya</p>
          </div>
          <div class="summary">
            <div class="summary-item"><div class="value">${data.length}</div><div class="label">Total Animals</div></div>
            <div class="summary-item"><div class="value">${data.filter((a) => a.health === "Healthy").length}</div><div class="label">Healthy</div></div>
            <div class="summary-item"><div class="value">${new Set(data.map((a) => a.county)).size}</div><div class="label">Counties</div></div>
          </div>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Health</th><th>County</th><th>Owner</th></tr></thead>
            <tbody>${data.map((animal) => `<tr><td>#${animal.id}</td><td>${animal.name}</td><td>${animal.type}</td><td class="health-${animal.health.toLowerCase().replace(" ", "-")}">${animal.health}</td><td>${animal.county}</td><td>${animal.owner}</td></tr>`).join("")}</tbody>
          </table>
          <div class="footer">
            <p><strong>Livestock Tracker System</strong></p>
            <p>Kenya Agricultural and Livestock Research Organisation (KALRO) Compliant</p>
            <p style="margin-top: 10px;">This report contains ${data.length} livestock records</p>
          </div>
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="background: #15803D; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-family: 'Fira Sans', sans-serif;">Print / Save as PDF</button>
            <button onclick="window.close()" style="background: #6B8A6B; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-left: 10px; font-family: 'Fira Sans', sans-serif;">Close</button>
          </div>
        </body></html>`;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error("PDF generation failed:", error);
      setExportError("PDF generation failed. Please try again.");
      setTimeout(() => setExportError(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const exportKALROFormat = () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const kalroData = {
        reportDate: new Date().toISOString(),
        reportType: "LIVESTOCK_INVENTORY",
        generatedBy: "Livestock Tracker System",
        summary: {
          totalAnimals: data.length,
          healthyCount: data.filter((a) => a.health === "Healthy").length,
          sickCount: data.filter((a) => a.health === "Sick").length,
          underTreatmentCount: data.filter((a) => a.health === "Under Treatment").length,
          recoveredCount: data.filter((a) => a.health === "Recovered").length,
          counties: [...new Set(data.map((a) => a.county))],
        },
        animals: data.map((animal) => ({
          id: animal.id, name: animal.name, type: animal.type,
          healthStatus: animal.health,
          location: { county: animal.county, coordinates: { latitude: animal.lat, longitude: animal.lng } },
          owner: animal.owner, registrationDate: animal.createdAt || new Date().toISOString(),
        })),
      };

      const blob = new Blob([JSON.stringify(kalroData, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `KALRO-Report-${new Date().toISOString().split("T")[0]}.json`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("KALRO export failed:", error);
      setExportError("Export failed. Please try again.");
      setTimeout(() => setExportError(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      {exportError && (
        <div className="absolute top-full mt-2 right-0 text-xs text-error bg-error/10 px-3 py-2 rounded-lg border border-error/20 whitespace-nowrap z-20">
          {exportError}
        </div>
      )}
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || data.length === 0}
        aria-haspopup="menu"
        aria-expanded={showMenu}
        className={`btn btn-primary flex items-center gap-2 ${
          isExporting || data.length === 0 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isExporting ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export Data</span>
          </>
        )}
      </button>

      {showMenu && !isExporting && (
        <div ref={menuRef} role="menu" aria-label="Export format options" className="absolute right-0 mt-2 w-64 bg-bg-primary border border-border rounded-xl shadow-xl z-10 animate-scaleIn">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Export Format
            </div>

            <button
              onClick={exportToCSV}
              role="menuitem"
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-bg-secondary transition-colors flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">CSV Export</div>
                <div className="text-xs text-text-tertiary">Excel-compatible format</div>
              </div>
            </button>

            <button
              onClick={exportToPDF}
              role="menuitem"
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-bg-secondary transition-colors flex items-center gap-3 cursor-pointer mt-1"
            >
              <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">PDF Report</div>
                <div className="text-xs text-text-tertiary">Printable certificate</div>
              </div>
            </button>

            <button
              onClick={exportKALROFormat}
              role="menuitem"
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-bg-secondary transition-colors flex items-center gap-3 cursor-pointer mt-1"
            >
              <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15l2 2 4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">KALRO Format</div>
                <div className="text-xs text-text-tertiary">Government submission</div>
              </div>
            </button>
          </div>

          <div className="border-t border-border p-2">
            <div className="px-3 py-2 text-xs text-text-tertiary">
              {data.length} {data.length === 1 ? "record" : "records"} will be exported
            </div>
          </div>
        </div>
      )}

      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}
