// src/components/alerts/__tests__/HealthAlerts.test.tsx
import { fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Livestock } from "@wam-mfugo/shared";
import HealthAlerts from "../HealthAlerts";

const mockSickAnimal: Livestock = {
  id: 1,
  name: "Cow",
  type: "Cattle",
  health: "Sick",
  county: "Nakuru",
  owner: "Farmer Joe",
  lat: -1.29,
  lng: 36.82,
};

const mockHealthyAnimal: Livestock = {
  id: 2,
  name: "Goat",
  type: "Goat",
  health: "Healthy",
  county: "Kiambu",
  owner: "Farmer Jane",
  lat: -1.44,
  lng: 37.0,
};

const mockRecoveredAnimal: Livestock = {
  id: 3,
  name: "Sheep",
  type: "Sheep",
  health: "Recovered",
  county: "Narok",
  owner: "Farmer Bob",
  lat: -1.08,
  lng: 35.87,
};

const mockTreatmentAnimal: Livestock = {
  id: 4,
  name: "Camel",
  type: "Camel",
  health: "Under Treatment",
  county: "Garissa",
  owner: "Farmer Amina",
  lat: -0.45,
  lng: 39.64,
};

describe("HealthAlerts", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows all systems normal when only healthy animals", () => {
    render(<HealthAlerts data={[mockHealthyAnimal]} />);
    expect(screen.getByText(/All Systems Normal/)).toBeInTheDocument();
    expect(screen.getByText(/No critical health alerts/)).toBeInTheDocument();
  });

  it("renders sick animal alert as critical", () => {
    render(<HealthAlerts data={[mockSickAnimal]} />);
    expect(screen.getByText(/1 Sick Animal Require/)).toBeInTheDocument();
  });

  it("renders under treatment alert as warning", () => {
    render(<HealthAlerts data={[mockTreatmentAnimal]} />);
    expect(screen.getByText(/1 Animal Under Treatment/)).toBeInTheDocument();
  });

  it("renders recovered alert as info", () => {
    render(<HealthAlerts data={[mockRecoveredAnimal]} />);
    expect(screen.getByText(/1 Animal Has Recovered/)).toBeInTheDocument();
  });

  it("counts multiple sick animals correctly", () => {
    const sickAnimals = [
      { ...mockSickAnimal, id: 1 },
      { ...mockSickAnimal, id: 2 },
      { ...mockSickAnimal, id: 3 },
    ];
    render(<HealthAlerts data={sickAnimals} />);
    expect(screen.getByText(/3 Sick Animals Require/)).toBeInTheDocument();
  });

  it("triggers outbreak alert when 3+ sick in same county", () => {
    const sickInNakuru = [
      { ...mockSickAnimal, id: 1, county: "Nakuru" },
      { ...mockSickAnimal, id: 2, county: "Nakuru" },
      { ...mockSickAnimal, id: 3, county: "Nakuru" },
    ];
    render(<HealthAlerts data={sickInNakuru} />);
    expect(screen.getByText(/Potential Disease Outbreak in Nakuru/)).toBeInTheDocument();
  });

  it("dismisses alert and saves to localStorage", async () => {
    render(<HealthAlerts data={[mockSickAnimal]} />);

    // Use fireEvent to click dismiss (synchronous, avoids timer issues)
    fireEvent.click(screen.getByText("Dismiss"));

    // Advance past dismiss timeout (200ms) + unmount animation (200ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.queryByText(/Sick Animal/)).not.toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem("livestock-dismissed-alerts")!);
    expect(stored).toContain("sick-animals");
  });

  it("restores dismissed alert", async () => {
    render(<HealthAlerts data={[mockSickAnimal]} />);

    // Dismiss
    fireEvent.click(screen.getByText("Dismiss"));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Show dismissed
    fireEvent.click(screen.getByText(/Show.*dismissed/));

    // Restore
    fireEvent.click(screen.getByText("Restore"));

    expect(screen.getByText(/Sick Animal/)).toBeInTheDocument();
  });
});
