// src/pages/MapView.tsx

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Livestock } from "../data/livestockData";

// Health colors for markers
const healthColors: Record<string, string> = {
  Healthy: "#3BA55C",
  Sick: "#EF4444",
  "Under Treatment": "#D4A017",
  Recovered: "#60A5FA",
};

interface MapViewProps {
  data: Livestock[];
}

export default function MapView({ data }: MapViewProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Livestock Map
        </h1>
        <div className="bg-[var(--bg-secondary)] px-4 py-2 rounded-lg border border-[var(--border-color)]">
          <span className="text-[var(--text-secondary)]">Showing: </span>
          <span className="font-bold text-[var(--text-primary)]">
            {data.length} animals
          </span>
        </div>
      </div>

      <div className="h-[500px] rounded-xl shadow border border-[var(--border-color)] overflow-hidden">
        <MapContainer
          center={[-0.0236, 37.9062]}
          zoom={6.5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((animal) => (
            <Marker
              key={animal.id}
              position={[animal.lat, animal.lng]}
              eventHandlers={{
                add: (e: any) => {
                  const marker = e.target;
                  const color = healthColors[animal.health];
                  if (marker.getElement) {
                    marker.getElement().innerHTML = `
                      <div style="
                        background-color: ${color}; 
                        width: 12px; 
                        height: 12px; 
                        border-radius: 50%; 
                        border: 2px solid white; 
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      "></div>
                    `;
                  }
                },
              }}
            >
              <Popup>
                <div className="text-[var(--text-primary)] min-w-[200px]">
                  <div className="font-bold text-lg">{animal.name}</div>
                  <div className="text-sm opacity-80">({animal.type})</div>
                  <div className="mt-2 space-y-1">
                    <div>
                      <span className="font-medium">County:</span>{" "}
                      {animal.county}
                    </div>
                    <div>
                      <span className="font-medium">Health:</span>
                      <span
                        className="ml-1 px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${healthColors[animal.health]}20`,
                          color: healthColors[animal.health],
                        }}
                      >
                        {animal.health}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Owner:</span> {animal.owner}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-color)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-2">
          Map Legend
        </h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(healthColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border border-white shadow"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-[var(--text-primary)]">
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
