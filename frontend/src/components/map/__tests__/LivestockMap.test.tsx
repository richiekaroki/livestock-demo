// src/components/map/__tests__/LivestockMap.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Livestock } from "../../../types";
import LivestockMap from "../LivestockMap";

// Mock Leaflet and related components
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, center, zoom }: any) => (
    <div
      data-testid="map-container"
      data-center={JSON.stringify(center)}
      data-zoom={zoom}
    >
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer">TileLayer</div>,
  Marker: ({ position, children }: any) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

vi.mock("react-leaflet-cluster", () => ({
  default: ({ children }: any) => (
    <div data-testid="marker-cluster">{children}</div>
  ),
}));

vi.mock("../HeatmapLayer", () => ({
  default: ({ data, metric }: any) => (
    <div data-testid="heatmap-layer" data-metric={metric}>
      Heatmap for {data.length} animals
    </div>
  ),
}));

// Properly typed mock data
const mockData: Livestock[] = [
  {
    id: 1,
    name: "Bessie",
    type: "Cattle", //  Now correctly typed as union type
    health: "Healthy",
    county: "Nakuru",
    owner: "John",
    lat: -0.303,
    lng: 36.08,
  },
  {
    id: 2,
    name: "Billy",
    type: "Goat", //  Now correctly typed
    health: "Sick",
    county: "Kiambu",
    owner: "Jane",
    lat: -1.016,
    lng: 37.852,
  },
];

describe("LivestockMap", () => {
  it("renders map container with correct initial view", () => {
    render(<LivestockMap data={mockData} />);

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
  });

  it("toggles heatmap visibility", () => {
    render(<LivestockMap data={mockData} />);

    const heatmapButton = screen.getByRole("button", { name: /show heatmap/i });
    fireEvent.click(heatmapButton);

    expect(screen.getByTestId("heatmap-layer")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /hide heatmap/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /hide heatmap/i }));
    expect(screen.queryByTestId("heatmap-layer")).not.toBeInTheDocument();
  });

  it("changes heatmap metric", () => {
    render(<LivestockMap data={mockData} />);

    fireEvent.click(screen.getByRole("button", { name: /show heatmap/i }));

    const metricSelect = screen.getByDisplayValue("All Animals");
    fireEvent.change(metricSelect, { target: { value: "sick" } });

    const heatmap = screen.getByTestId("heatmap-layer");
    expect(heatmap).toHaveAttribute("data-metric", "sick");
  });

  it("shows heatmap legend when heatmap is visible", () => {
    render(<LivestockMap data={mockData} />);

    expect(screen.queryByText(/heatmap legend/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show heatmap/i }));

    expect(screen.getByText(/heatmap legend/i)).toBeInTheDocument();
    expect(screen.getByText(/healthy/i)).toBeInTheDocument();
    expect(screen.getByText(/sick/i)).toBeInTheDocument();
  });

  it("renders correct number of markers", () => {
    render(<LivestockMap data={mockData} />);

    expect(screen.getByTestId("marker-cluster")).toBeInTheDocument();
  });
});
