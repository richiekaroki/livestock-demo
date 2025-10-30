// src/components/animals/__tests__/AnimalList.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Livestock } from "../../../types";
import AnimalList from "../AnimalList";

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
];

describe("AnimalList", () => {
  it("should display animals", () => {
    render(<AnimalList data={mockAnimals} />);

    expect(screen.getByText("Bessie")).toBeInTheDocument();
    expect(screen.getByText("Billy")).toBeInTheDocument();
    expect(screen.getByText("Cattle")).toBeInTheDocument();
    expect(screen.getByText("Goat")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Sick")).toBeInTheDocument();
  });

  it("should show empty state when no animals", () => {
    render(<AnimalList data={[]} />);

    expect(
      screen.getByText(/no animals found matching your filters/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/try adjusting your filter criteria/i)
    ).toBeInTheDocument();
  });

  it("should display Pig and Chicken types correctly", () => {
    const animalsWithNewTypes: Livestock[] = [
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
      {
        id: 4,
        name: "Clucky",
        type: "Chicken",
        health: "Under Treatment",
        county: "Nakuru",
        owner: "Mary",
        lat: -0.303,
        lng: 36.08,
      },
    ];

    render(<AnimalList data={animalsWithNewTypes} />);

    expect(screen.getByText("Porky")).toBeInTheDocument();
    expect(screen.getByText("Clucky")).toBeInTheDocument();
    expect(screen.getByText("Pig")).toBeInTheDocument();
    expect(screen.getByText("Chicken")).toBeInTheDocument();
    expect(screen.getByText("Under Treatment")).toBeInTheDocument();
  });

  it("should show correct animal count", () => {
    render(<AnimalList data={mockAnimals} />);

    expect(screen.getByText("2 animals found")).toBeInTheDocument();
  });

  it("should show singular animal count", () => {
    const singleAnimal = [mockAnimals[0]];
    render(<AnimalList data={singleAnimal} />);

    expect(screen.getByText("1 animal found")).toBeInTheDocument();
  });

  it("should display all table headers", () => {
    render(<AnimalList data={mockAnimals} />);

    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Health Status")).toBeInTheDocument();
    expect(screen.getByText("County")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
  });
});
