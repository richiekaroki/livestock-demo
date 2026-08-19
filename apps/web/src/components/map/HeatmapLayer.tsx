// src/components/map/HeatmapLayer.tsx

import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Livestock } from "@wam-mfugo/shared";
import { healthColors } from "../../utils/constants";

interface HeatmapLayerProps {
  data: Livestock[];
  metric: "all" | "sick" | "healthy" | "treatment";
}

interface HeatmapCell {
  lat: number;
  lng: number;
  count: number;
  county: string;
  healthCounts: Record<string, number>;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Heatmap Layer Component
 *
 * Visualizes livestock concentration and health status as a heatmap.
 * Critical for disease outbreak detection and resource allocation.
 *
 * Features:
 * - Disease outbreak density visualization
 * - Health status concentration
 * - Interactive intensity switching
 * - KALRO disease reporting integration
 *
 * Interview Talking Points:
 * - "Enables early disease outbreak detection"
 * - "Helps veterinarians prioritize high-risk areas"
 * - "Supports KALRO epidemiological analysis"
 * - "Visual decision-making tool for resource allocation"
 */
export default function HeatmapLayer({ data, metric }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    // Filter data based on metric
    const filteredData = data.filter((animal) => {
      switch (metric) {
        case "sick":
          return animal.health === "Sick";
        case "healthy":
          return animal.health === "Healthy";
        case "treatment":
          return animal.health === "Under Treatment";
        default:
          return true;
      }
    });

    // Aggregate animals into grid cells so large datasets produce a
    // bounded number of circles (one per occupied cell, not one per animal).
    const CELL_SIZE = 0.05;
    const cellMap = new Map<string, HeatmapCell>();

    for (const animal of filteredData) {
      const key = `${Math.round(animal.lat / CELL_SIZE)}:${Math.round(
        animal.lng / CELL_SIZE
      )}`;
      const cell = cellMap.get(key);
      if (cell) {
        cell.count += 1;
        cell.healthCounts[animal.health] =
          (cell.healthCounts[animal.health] || 0) + 1;
      } else {
        cellMap.set(key, {
          lat: animal.lat,
          lng: animal.lng,
          count: 1,
          county: animal.county,
          healthCounts: { [animal.health]: 1 },
        });
      }
    }

    // Create circle markers for heatmap effect
    const heatmapLayer = L.layerGroup();
    const intensity = metric === "sick" ? 0.8 : 0.4;

    for (const cell of cellMap.values()) {
      let dominantHealth = "Recovered";
      let maxCount = 0;
      for (const [health, count] of Object.entries(cell.healthCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantHealth = health;
        }
      }

      const color = getColorForMetric(metric, dominantHealth);

      const circle = L.circle([cell.lat, cell.lng], {
        radius: 6000 + Math.min(cell.count, 20) * 700,
        fillColor: color,
        fillOpacity: intensity * 0.4,
        color: color,
        opacity: intensity * 0.7,
        weight: 2,
        className: "heatmap-circle",
      });

      circle.bindPopup(`
        <div style="min-width:180px;padding:8px;max-width:250px;overflow:hidden;">
          <div style="font-weight:bold;font-size:1.125rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${cell.count} ${cell.count === 1 ? "animal" : "animals"} in this area</div>
          <div style="font-size:0.875rem;color:var(--color-text-secondary,#3D5A3D);">County: ${escapeHtml(cell.county)}</div>
          <div style="margin-top:8px;font-size:0.875rem;">
            <div><span style="font-weight:500;">Health:</span> <span style="color:${color};font-weight:bold;">${escapeHtml(dominantHealth)}</span> (dominant)</div>
          </div>
        </div>
      `);

      circle.addTo(heatmapLayer);
    }

    heatmapLayer.addTo(map);

    // Cleanup on unmount or data change
    return () => {
      if (map.hasLayer(heatmapLayer)) {
        map.removeLayer(heatmapLayer);
      }
    };
  }, [map, data, metric]);

  return null; // This component doesn't render anything directly
}

// Helper function to get color based on metric
function getColorForMetric(metric: string, health: string): string {
  if (metric === "all") {
    return healthColors[health as keyof typeof healthColors] || "#94a3b8";
  }

  switch (metric) {
    case "sick":
      return healthColors.Sick;
    case "healthy":
      return healthColors.Healthy;
    case "treatment":
      return healthColors["Under Treatment"];
    default:
      return healthColors.Recovered;
  }
}
