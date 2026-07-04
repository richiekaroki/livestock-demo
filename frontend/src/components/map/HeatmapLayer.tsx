// src/components/map/HeatmapLayer.tsx

import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Livestock } from "../../types";
import { healthColors } from "../../utils/constants";

interface HeatmapLayerProps {
  data: Livestock[];
  metric: "all" | "sick" | "healthy" | "treatment";
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

    // Create circle markers for heatmap effect
    const heatmapLayer = L.layerGroup();

    filteredData.forEach((animal) => {
      const intensity = metric === "sick" ? 0.8 : 0.4;
      const color = getColorForMetric(metric, animal.health);

      const circle = L.circle([animal.lat, animal.lng], {
        radius: 8000, // 8km radius for better visibility
        fillColor: color,
        fillOpacity: intensity * 0.4,
        color: color,
        opacity: intensity * 0.7,
        weight: 2,
        className: "heatmap-circle",
      });

      // Add popup with details
      circle.bindPopup(`
        <div style="min-width:180px;padding:8px;max-width:250px;overflow:hidden;">
          <div style="font-weight:bold;font-size:1.125rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(animal.name)}</div>
          <div style="font-size:0.875rem;color:var(--color-text-secondary,#3D5A3D);">${escapeHtml(animal.type)}</div>
          <div style="margin-top:8px;font-size:0.875rem;">
            <div><span style="font-weight:500;">Health:</span> <span style="color:${color};font-weight:bold;">${escapeHtml(animal.health)}</span></div>
            <div><span style="font-weight:500;">Owner:</span> ${escapeHtml(animal.owner)}</div>
            <div><span style="font-weight:500;">County:</span> ${escapeHtml(animal.county)}</div>
          </div>
        </div>
      `);

      circle.addTo(heatmapLayer);
    });

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
