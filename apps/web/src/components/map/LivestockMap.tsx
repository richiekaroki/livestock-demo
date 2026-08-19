// src/components/map/LivestockMap.tsx

import L from "leaflet";
import { useCallback, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { Livestock } from "@wam-mfugo/shared";
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
  const [mapError, setMapError] = useState(false);
  const tileErrorCount = useRef(0);

  const handleTileError = useCallback(() => {
    tileErrorCount.current += 1;
    if (tileErrorCount.current >= 5) {
      setMapError(true);
    }
  }, []);

  const handleRetry = useCallback(() => {
    tileErrorCount.current = 0;
    setMapError(false);
  }, []);

  if (mapError) {
    return (
      <div className="h-[500px] rounded-xl flex items-center justify-center bg-bg-secondary border border-border">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-text-secondary font-medium mb-1">Map failed to load</p>
          <p className="text-text-tertiary text-sm mb-4">Check your connection and try again.</p>
          <button
            onClick={handleRetry}
            className="btn btn-primary text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[500px] rounded-xl flex items-center justify-center bg-bg-secondary border border-border">
        <div className="text-center p-6 max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center" aria-hidden="true">
            <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
          </div>
          <p className="text-text-primary font-semibold mb-1">No animals on map</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Clear the filters above to see all registered livestock across Kenya.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-xl shadow-lg border border-border overflow-hidden relative">
      {/* Heatmap Controls */}
      <div className="absolute top-4 right-4 z-[1000] heatmap-controls">
        <div className="flex flex-col gap-3">
          {/* Toggle Button */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            aria-pressed={showHeatmap}
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
              aria-label="Heatmap metric"
              className="input-field text-sm"
            >
              <option value="all">All Animals</option>
              <option value="sick">Sick Only</option>
              <option value="healthy">Healthy Only</option>
              <option value="treatment">Under Treatment</option>
            </select>
          )}
        </div>
      </div>

      {/* Compact Legend Overlay — bottom-left, responsive */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs shadow-sm max-sm:bottom-auto max-sm:top-16">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-success border-2 border-bg-primary shadow-sm" />
            <span className="text-text-secondary">Healthy</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-error border-2 border-bg-primary shadow-sm" />
            <span className="text-text-secondary">Sick</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-warning border-2 border-bg-primary shadow-sm" />
            <span className="text-text-secondary">Treatment</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-info border-2 border-bg-primary shadow-sm" />
            <span className="text-text-secondary">Recovered</span>
          </span>
        </div>
      </div>

      <MapContainer
        center={[-0.0236, 37.9062]} // Kenya center
        zoom={6.5}
        style={{ height: "100%", width: "100%" }}
        className="map-container"
        aria-label="Livestock distribution map of Kenya"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: handleTileError }}
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
                  <div className="map-popup-name">{animal.name}</div>
                  <div className="map-popup-type">({animal.type})</div>
                  <div className="map-popup-detail space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="map-popup-label">Health:</span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium capitalize"
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
                      <span className="map-popup-label">County:</span>
                      <span className="map-popup-value">{animal.county}</span>
                    </div>
                    <div>
                      <span className="map-popup-label">Owner:</span>
                      <span className="map-popup-value">{animal.owner}</span>
                    </div>
                    {animal.createdAt && (
                      <div className="map-popup-date">
                        Registered: {new Date(animal.createdAt).toLocaleDateString()}
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
