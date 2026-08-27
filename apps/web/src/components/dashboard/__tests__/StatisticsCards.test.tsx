// src/components/dashboard/__tests__/StatisticsCards.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AnimalStats } from "@wam-mfugo/shared";
import StatisticsCards from "../StatisticsCards";

const mockStats: AnimalStats = {
  totalAnimals: 150,
  healthyCount: 120,
  sickCount: 15,
  underTreatmentCount: 10,
  recoveredCount: 5,
  counties: 5,
  lastUpdated: "2024-10-01T12:00:00Z",
};

describe("StatisticsCards", () => {
  it("renders total animals count", () => {
    render(<StatisticsCards stats={mockStats} />);
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("total animals")).toBeInTheDocument();
  });

  it("renders healthy count", () => {
    render(<StatisticsCards stats={mockStats} />);
    const items = screen.getAllByText("120");
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("renders sick count", () => {
    render(<StatisticsCards stats={mockStats} />);
    const items = screen.getAllByText("15");
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Sick")).toBeInTheDocument();
  });

  it("renders under treatment count", () => {
    render(<StatisticsCards stats={mockStats} />);
    const items = screen.getAllByText("10");
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Treatment")).toBeInTheDocument();
  });

  it("renders recovered count", () => {
    render(<StatisticsCards stats={mockStats} />);
    expect(screen.getByText("Recovered")).toBeInTheDocument();
    const fives = screen.getAllByText("5");
    expect(fives.length).toBeGreaterThanOrEqual(2);
  });

  it("renders counties count", () => {
    render(<StatisticsCards stats={mockStats} />);
    expect(screen.getByText("Counties")).toBeInTheDocument();
  });

  it("renders last updated timestamp", () => {
    render(<StatisticsCards stats={mockStats} />);
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it("formats large numbers with locale separators", () => {
    const largeStats: AnimalStats = {
      ...mockStats,
      totalAnimals: 12345,
      healthyCount: 10000,
    };
    render(<StatisticsCards stats={largeStats} />);
    expect(screen.getByText("12,345")).toBeInTheDocument();
    const tenK = screen.getAllByText("10,000");
    expect(tenK.length).toBeGreaterThanOrEqual(1);
  });

  it("hides last updated when not provided", () => {
    const statsNoDate: AnimalStats = {
      ...mockStats,
      lastUpdated: "",
    };
    render(<StatisticsCards stats={statsNoDate} />);
    expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument();
  });
});
