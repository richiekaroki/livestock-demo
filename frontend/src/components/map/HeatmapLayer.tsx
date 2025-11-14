// src/components/map/HeatmapLayer.tsx

import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Livestock } from "../../types";

interface HeatmapLayerProps {
  data: Livestock[];
  metric: "all" | "sick" | "healthy" | "treatment";
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
        <div class="min-w-[180px] p-2">
          <div class="font-bold text-lg text-gray-800 dark:text-gray-200">${animal.name}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">${animal.type}</div>
          <div class="mt-2 space-y-1 text-sm">
            <div><span class="font-medium">Health:</span> <span style="color: ${color}; font-weight: bold;">${animal.health}</span></div>
            <div><span class="font-medium">Owner:</span> ${animal.owner}</div>
            <div><span class="font-medium">County:</span> ${animal.county}</div>
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
    // Color by health status
    switch (health) {
      case "Healthy":
        return "#22c55e"; // green-500
      case "Sick":
        return "#ef4444"; // red-500
      case "Under Treatment":
        return "#eab308"; // yellow-500
      case "Recovered":
        return "#3b82f6"; // blue-500
      default:
        return "#94a3b8"; // slate-400
    }
  }

  // Single metric colors
  switch (metric) {
    case "sick":
      return "#ef4444"; // red-500
    case "healthy":
      return "#22c55e"; // green-500
    case "treatment":
      return "#eab308"; // yellow-500
    default:
      return "#3b82f6"; // blue-500
  }
}
