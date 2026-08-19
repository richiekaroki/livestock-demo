// src/components/animals/__tests__/AnimalList.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Livestock } from "@wam-mfugo/shared";
import AnimalList from "../AnimalList";

const mockAnimals: Livestock[] = [
  {
    id: 1,
    name: "Cow A",
    type: "Cattle",
    health: "Healthy",
    county: "Nakuru",
    owner: "Farmer Joe",
    lat: -1.29,
    lng: 36.82,
  },
  {
    id: 2,
    name: "Goat B",
    type: "Goat",
    health: "Sick",
    county: "Kiambu",
    owner: "Farmer Jane",
    lat: -1.44,
    lng: 37.0,
  },
  {
    id: 3,
    name: "Sheep C",
    type: "Sheep",
    health: "Recovered",
    county: "Narok",
    owner: "Farmer Bob",
    lat: -1.08,
    lng: 35.87,
  },
];

describe("AnimalList", () => {
  it("renders empty state when no data", () => {
    render(<AnimalList data={[]} />);
    expect(screen.getByText("No animals found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your filters or add new animals")).toBeInTheDocument();
  });

  it("renders all animals", () => {
    render(<AnimalList data={mockAnimals} />);
    expect(screen.getByText("Cow A")).toBeInTheDocument();
    expect(screen.getByText("Goat B")).toBeInTheDocument();
    expect(screen.getByText("Sheep C")).toBeInTheDocument();
  });

  it("displays animal type badges", () => {
    render(<AnimalList data={mockAnimals} />);
    expect(screen.getByText("Cattle")).toBeInTheDocument();
    expect(screen.getByText("Goat")).toBeInTheDocument();
    expect(screen.getByText("Sheep")).toBeInTheDocument();
  });

  it("displays health status badges", () => {
    render(<AnimalList data={mockAnimals} />);
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Sick")).toBeInTheDocument();
    expect(screen.getByText("Recovered")).toBeInTheDocument();
  });

  it("displays county for each animal", () => {
    render(<AnimalList data={mockAnimals} />);
    // County labels appear multiple times — check at least one exists
    const countyLabels = screen.getAllByText("County:");
    expect(countyLabels.length).toBe(3);
  });

  it("displays owner for each animal", () => {
    render(<AnimalList data={mockAnimals} />);
    const ownerLabels = screen.getAllByText("Owner:");
    expect(ownerLabels.length).toBe(3);
  });

  it("displays animal ID", () => {
    render(<AnimalList data={mockAnimals} />);
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
  });

  it("renders grid layout with multiple animals", () => {
    const { container } = render(<AnimalList data={mockAnimals} />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
  });

  it("handles single animal", () => {
    render(<AnimalList data={[mockAnimals[0]]} />);
    expect(screen.getByText("Cow A")).toBeInTheDocument();
    expect(screen.queryByText("Goat B")).not.toBeInTheDocument();
  });
});
