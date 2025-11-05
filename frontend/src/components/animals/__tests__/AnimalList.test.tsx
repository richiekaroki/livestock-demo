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

    expect(screen.getByText(/no animals found/i)).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
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

    // Check that multiple animals are displayed in the grid
    const animalCards = screen.getAllByText(/County:/);
    expect(animalCards).toHaveLength(2);
  });

  it("should display all animal information", () => {
    render(<AnimalList data={mockAnimals} />);

    expect(screen.getByText("Bessie")).toBeInTheDocument();
    expect(screen.getByText("Cattle")).toBeInTheDocument();
    expect(screen.getByText("Nakuru")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("handles very long animal names gracefully", () => {
    const longNameAnimal = [
      {
        ...mockAnimals[0],
        name: "Very Long Animal Name That Should Be Displayed Without Truncation In This Component",
      },
    ];
    render(<AnimalList data={longNameAnimal} />);
    expect(
      screen.getByText(
        /Very Long Animal Name That Should Be Displayed Without Truncation In This Component/
      )
    ).toBeInTheDocument();
  });

  it("applies correct CSS classes for health status", () => {
    render(<AnimalList data={mockAnimals} />);

    // Test Healthy badge
    const healthyBadge = screen.getByText("Healthy").closest(".badge");
    expect(healthyBadge).toBeInTheDocument();

    // Test Sick badge
    const sickBadge = screen.getByText("Sick").closest(".badge");
    expect(sickBadge).toBeInTheDocument();

    // Test that badges have the badge class
    const badges = screen
      .getAllByText(/Healthy|Sick/)
      .map((el) => el.closest(".badge"));
    badges.forEach((badge) => {
      expect(badge).toHaveClass("badge");
    });
  });

  it("applies correct CSS classes for animal types", () => {
    render(<AnimalList data={mockAnimals} />);

    // Test Cattle type badge
    const cattleBadge = screen.getByText("Cattle").closest(".badge");
    expect(cattleBadge).toBeInTheDocument();

    // Test Goat type badge
    const goatBadge = screen.getByText("Goat").closest(".badge");
    expect(goatBadge).toBeInTheDocument();

    // Test that type badges have the badge class
    const typeBadges = screen
      .getAllByText(/Cattle|Goat/)
      .map((el) => el.closest(".badge"));
    typeBadges.forEach((badge) => {
      expect(badge).toHaveClass("badge");
    });
  });

  it("displays animal IDs correctly", () => {
    render(<AnimalList data={mockAnimals} />);

    expect(screen.getByText("ID: #1")).toBeInTheDocument();
    expect(screen.getByText("ID: #2")).toBeInTheDocument();
  });

  it("has responsive grid layout classes", () => {
    const { container } = render(<AnimalList data={mockAnimals} />);

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("grid");
    expect(grid).toHaveClass("gap-4");
    expect(grid).toHaveClass("md:grid-cols-2");
    expect(grid).toHaveClass("lg:grid-cols-3");
  });
});
