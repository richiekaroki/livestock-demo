// src/components/map/LivestockMap.tsx

import L from "leaflet";
import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { Livestock } from "../../types";
import { healthColors } from "../../utils/constants";
import HeatmapLayer from "./HeatmapLayer";

interface LivestockMapProps {
  data: Livestock[];
}

interface LeafletEvent {
  target: {
    getElement: () => HTMLElement | null;
  };
}

// Cluster interface
interface Cluster {
  getChildCount: () => number;
}

const createClusterCustomIcon = (cluster: Cluster) => {
  return L.divIcon({
    html: `<span class="flex items-center justify-center w-full h-full font-bold">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: L.point(40, 40, true),
  });
};

type HeatmapMetric = "all" | "sick" | "healthy" | "treatment";

export default function LivestockMap({ data }: LivestockMapProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapMetric, setHeatmapMetric] = useState<HeatmapMetric>("all");

  return (
    <div className="h-[500px] rounded-xl shadow-lg border border-border overflow-hidden relative">
      {/* Heatmap Controls */}
      <div className="absolute top-4 right-4 z-[1000] heatmap-controls">
        <div className="flex flex-col gap-3">
          {/* Toggle Button */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`btn text-sm ${
              showHeatmap ? "btn-primary" : "btn-secondary"
            }`}
          >
            {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
          </button>

          {/* Metric Selector */}
          {showHeatmap && (
            <select
              value={heatmapMetric}
              onChange={(e) =>
                setHeatmapMetric(e.target.value as HeatmapMetric)
              }
              className="input-field text-sm"
            >
              <option value="all">All Animals</option>
              <option value="sick">Sick Only</option>
              <option value="healthy">Healthy Only</option>
              <option value="treatment">Under Treatment</option>
            </select>
          )}

          {/* Heatmap Legend */}
          {showHeatmap && (
            <div className="heatmap-legend">
              <div className="text-xs font-medium text-text-primary mb-2">
                Heatmap Legend:
              </div>
              <div className="space-y-1 text-xs">
                {heatmapMetric === "all" ? (
                  <>
                    <div className="heatmap-legend-item">
                      <div className="heatmap-legend-color bg-green-500"></div>
                      <span className="text-text-secondary">Healthy</span>
                    </div>
                    <div className="heatmap-legend-item">
                      <div className="heatmap-legend-color bg-red-500"></div>
                      <span className="text-text-secondary">Sick</span>
                    </div>
                    <div className="heatmap-legend-item">
                      <div className="heatmap-legend-color bg-yellow-500"></div>
                      <span className="text-text-secondary">Treatment</span>
                    </div>
                    <div className="heatmap-legend-item">
                      <div className="heatmap-legend-color bg-blue-500"></div>
                      <span className="text-text-secondary">Recovered</span>
                    </div>
                  </>
                ) : (
                  <div className="heatmap-legend-item">
                    <div
                      className="heatmap-legend-color"
                      style={{
                        backgroundColor: getHeatmapColor(heatmapMetric),
                      }}
                    ></div>
                    <span className="text-text-secondary">
                      {heatmapMetric === "sick" && "Sick Animals"}
                      {heatmapMetric === "healthy" && "Healthy Animals"}
                      {heatmapMetric === "treatment" &&
                        "Animals Under Treatment"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={[-0.0236, 37.9062]} // Kenya center
        zoom={6.5}
        style={{ height: "100%", width: "100%" }}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Heatmap Layer */}
        {showHeatmap && <HeatmapLayer data={data} metric={heatmapMetric} />}

        {/* Marker Clusters */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          iconCreateFunction={createClusterCustomIcon}
          spiderfyDistanceMultiplier={1.5}
        >
          {data.map((animal) => (
            <Marker
              key={animal.id}
              position={[animal.lat, animal.lng]}
              eventHandlers={{
                add: (e: LeafletEvent) => {
                  const marker = e.target;
                  const color = healthColors[animal.health];
                  if (marker.getElement) {
                    const element = marker.getElement();
                    if (element) {
                      element.innerHTML = `
                        <div style="
                          background-color: ${color}; 
                          width: 16px; 
                          height: 16px; 
                          border-radius: 50%; 
                          border: 3px solid white; 
                          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                          cursor: pointer;
                        "></div>
                      `;
                    }
                  }
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="min-w-[220px]">
                  <div className="font-bold text-lg text-text-primary">
                    {animal.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    ({animal.type})
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">
                        Health:
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium capitalize"
                        style={{
                          backgroundColor: `${healthColors[animal.health]}20`,
                          color: healthColors[animal.health],
                          border: `1px solid ${healthColors[animal.health]}40`,
                        }}
                      >
                        {animal.health}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-primary">
                        County:
                      </span>
                      <span className="text-text-secondary ml-1">
                        {animal.county}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-primary">
                        Owner:
                      </span>
                      <span className="text-text-secondary ml-1">
                        {animal.owner}
                      </span>
                    </div>
                    {animal.createdAt && (
                      <div className="text-xs text-text-tertiary mt-2">
                        Registered:{" "}
                        {new Date(animal.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

// Helper function for heatmap legend
function getHeatmapColor(metric: HeatmapMetric): string {
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
