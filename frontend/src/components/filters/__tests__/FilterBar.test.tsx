// src/components/filters/__tests__/FilterBar.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Livestock } from "../../../types";
import FilterBar from "../FilterBar";

let mockData: Livestock[];
const mockFilters = { type: "", county: "", health: "" };
const mockOnFilterChange = vi.fn();

beforeEach(() => {
  mockData = [
    {
      id: 1,
      name: "Bessie",
      type: "Cattle",
      health: "Healthy",
      county: "Nakuru",
      owner: "John",
      lat: -0.3,
      lng: 36.08,
    },
    {
      id: 2,
      name: "Billy",
      type: "Goat",
      health: "Sick",
      county: "Kiambu",
      owner: "Jane",
      lat: -1.01,
      lng: 37.85,
    },
    {
      id: 3,
      name: "Dolly",
      type: "Sheep",
      health: "Healthy",
      county: "Nakuru",
      owner: "John",
      lat: -0.3,
      lng: 36.08,
    },
  ];
  mockOnFilterChange.mockClear();
});

describe("🔍 FilterBar Component", () => {
  it("renders all dropdowns", () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        data={mockData}
      />
    );
    expect(screen.getByDisplayValue("All Types")).toBeInTheDocument();
    expect(screen.getByDisplayValue("All Counties")).toBeInTheDocument();
    expect(screen.getByDisplayValue("All Health Status")).toBeInTheDocument();
  });

  it("populates dropdowns with unique data", () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        data={mockData}
      />
    );
    const typeSelect = screen.getByDisplayValue("All Types");
    expect(typeSelect).toHaveTextContent(/Cattle|Goat|Sheep/);

    const countySelect = screen.getByDisplayValue("All Counties");
    expect(countySelect).toHaveTextContent(/Nakuru|Kiambu/);

    const healthSelect = screen.getByDisplayValue("All Health Status");
    expect(healthSelect).toHaveTextContent(/Healthy|Sick/);
  });

  it("triggers onFilterChange when filters are changed", () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        data={mockData}
      />
    );

    fireEvent.change(screen.getByDisplayValue("All Types"), {
      target: { value: "Cattle" },
    });
    expect(mockOnFilterChange).toHaveBeenCalledWith("type", "Cattle");

    fireEvent.change(screen.getByDisplayValue("All Counties"), {
      target: { value: "Nakuru" },
    });
    expect(mockOnFilterChange).toHaveBeenCalledWith("county", "Nakuru");
  });

  it("resets all filters when reset button is clicked", () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        data={mockData}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /reset filters/i }));

    expect(mockOnFilterChange).toHaveBeenCalledWith("type", "");
    expect(mockOnFilterChange).toHaveBeenCalledWith("county", "");
    expect(mockOnFilterChange).toHaveBeenCalledWith("health", "");
  });

  it("matches snapshot", () => {
    const { container } = render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        data={mockData}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
