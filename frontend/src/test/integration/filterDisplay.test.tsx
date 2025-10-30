// src/test/integration/filterDisplay.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AnimalList from "../../components/animals/AnimalList";
import FilterBar from "../../components/filters/FilterBar";
import type { Livestock } from "../../types";

const mockAnimals: Livestock[] = [
  {
    id: 1,
    name: "Bessie",
    type: "Cattle",
    health: "Healthy",
    county: "Nakuru",
    owner: "John",
    lat: -0.303,
    lng: 36.08,
  },
  {
    id: 2,
    name: "Billy",
    type: "Goat",
    health: "Sick",
    county: "Kiambu",
    owner: "Jane",
    lat: -1.016,
    lng: 37.852,
  },
  {
    id: 3,
    name: "Porky",
    type: "Pig",
    health: "Healthy",
    county: "Kiambu",
    owner: "Peter",
    lat: -1.016,
    lng: 37.852,
  },
];

describe("Filter + Display Integration", () => {
  it("should filter animals and update display", async () => {
    const user = userEvent.setup();
    let filteredData: Livestock[] = [...mockAnimals];

    const handleFilterChange = (key: string, value: string) => {
      if (key === "type" && value) {
        filteredData = mockAnimals.filter((animal) => animal.type === value);
      } else {
        filteredData = [...mockAnimals];
      }
    };

    const { rerender } = render(
      <div>
        <FilterBar
          filters={{ type: "", health: "", county: "" }}
          onFilterChange={handleFilterChange}
          data={mockAnimals}
        />
        <AnimalList data={filteredData} />
      </div>
    );

    // Verify all animals initially
    expect(screen.getByText("Bessie")).toBeInTheDocument();
    expect(screen.getByText("Billy")).toBeInTheDocument();
    expect(screen.getByText("Porky")).toBeInTheDocument();

    // Find the type filter - use getAllByRole for better selection
    const typeFilters = screen.getAllByRole("combobox");
    const typeFilter = typeFilters[0]; // First dropdown should be type filter

    await user.selectOptions(typeFilter, "Pig");

    // Re-render with filtered data
    rerender(
      <div>
        <FilterBar
          filters={{ type: "Pig", health: "", county: "" }}
          onFilterChange={handleFilterChange}
          data={mockAnimals}
        />
        <AnimalList data={filteredData} />
      </div>
    );

    // Verify only Pig is shown
    expect(screen.getByText("Porky")).toBeInTheDocument();
    expect(screen.queryByText("Bessie")).not.toBeInTheDocument();
    expect(screen.queryByText("Billy")).not.toBeInTheDocument();
  });
});
