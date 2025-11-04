// src/components/map/LivestockMap.tsx

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { Livestock } from "../../types";
import { healthColors } from "../../utils/constants";

interface LivestockMapProps {
  data: Livestock[];
}

interface LeafletEvent {
  target: {
    getElement: () => HTMLElement | null;
  };
}

// ✅ Strongly typed cluster parameter without MarkerCluster import
interface Cluster {
  getChildCount: () => number;
}

const createClusterCustomIcon = (cluster: Cluster) => {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: L.point(33, 33, true),
  });
};

export default function LivestockMap({ data }: LivestockMapProps) {
  return (
    <div className="h-[500px] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <MapContainer
        center={[-0.0236, 37.9062]}
        zoom={6.5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          iconCreateFunction={createClusterCustomIcon}
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
                          width: 12px; 
                          height: 12px; 
                          border-radius: 50%; 
                          border: 2px solid white; 
                          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        "></div>
                      `;
                    }
                  }
                },
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-bold text-lg text-gray-800">
                    {animal.name}
                  </div>
                  <div className="text-sm text-gray-600">({animal.type})</div>
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
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
