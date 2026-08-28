// src/components/alerts/__tests__/HealthAlerts.test.tsx
import { fireEvent, render, screen, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Livestock } from "@wam-mfugo/shared";

vi.mock("../../../hooks/useDelayedUnmount", () => ({
  useDelayedUnmount: () => ({ shouldRender: true, isAnimating: false }),
}));

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
  });

  it("shows all systems normal when only healthy animals", async () => {
    render(<HealthAlerts data={[mockHealthyAnimal]} />);
    await waitFor(() => {
      expect(screen.getByText(/All Systems Normal/)).toBeInTheDocument();
    });
    expect(screen.getByText(/No critical health alerts/)).toBeInTheDocument();
  });

  it("renders sick animal alert as critical", async () => {
    render(<HealthAlerts data={[mockSickAnimal]} />);
    await waitFor(() => {
      expect(screen.getByText(/Sick Animal Require/)).toBeInTheDocument();
    });
  });

  it("renders under treatment alert as warning", async () => {
    render(<HealthAlerts data={[mockTreatmentAnimal]} />);
    await waitFor(() => {
      expect(screen.getByText(/Animal Under Treatment/)).toBeInTheDocument();
    });
  });

  it("renders recovered alert as info", async () => {
    render(<HealthAlerts data={[mockRecoveredAnimal]} />);
    await waitFor(() => {
      expect(screen.getByText(/Animal Has Recovered/)).toBeInTheDocument();
    });
  });

  it("counts multiple sick animals correctly", async () => {
    const sickAnimals = [
      { ...mockSickAnimal, id: 1 },
      { ...mockSickAnimal, id: 2 },
      { ...mockSickAnimal, id: 3 },
    ];
    render(<HealthAlerts data={sickAnimals} />);
    await waitFor(() => {
      expect(screen.getByText(/Sick Animals Require/)).toBeInTheDocument();
    });
  });

  it("triggers outbreak alert when 3+ sick in same county", async () => {
    const sickInNakuru = [
      { ...mockSickAnimal, id: 1, county: "Nakuru" },
      { ...mockSickAnimal, id: 2, county: "Nakuru" },
      { ...mockSickAnimal, id: 3, county: "Nakuru" },
    ];
    render(<HealthAlerts data={sickInNakuru} />);
    await waitFor(() => {
      expect(screen.getByText(/Potential Disease Outbreak in Nakuru/)).toBeInTheDocument();
    });
  });

  it("dismisses alert and saves to localStorage", async () => {
    render(<HealthAlerts data={[mockSickAnimal]} />);

    await waitFor(() => {
      expect(screen.getByText(/Sick Animal/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Dismiss"));

    await waitFor(() => {
      expect(screen.queryByText(/Sick Animal/)).not.toBeInTheDocument();
    });

    const stored = JSON.parse(localStorage.getItem("livestock-dismissed-alerts")!);
    expect(stored).toContain("sick-animals");
  });

  it("restores dismissed alert", async () => {
    render(<HealthAlerts data={[mockSickAnimal]} />);

    await waitFor(() => {
      expect(screen.getByText(/Sick Animal/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Dismiss"));

    await waitFor(() => {
      expect(screen.queryByText(/Sick Animal/)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Show.*dismissed/));

    await waitFor(() => {
      expect(screen.getByText("Restore")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Restore"));

    await waitFor(() => {
      expect(screen.getByText(/Sick Animal/)).toBeInTheDocument();
    });
  });
});
