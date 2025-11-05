// src/components/alerts/__tests__/HealthAlerts.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Livestock } from "../../../types";
import HealthAlerts from "../HealthAlerts";

const mockData: Livestock[] = [
  {
    id: 1,
    name: "Sick Cow",
    type: "Cattle",
    health: "Sick",
    county: "Nakuru",
    owner: "John",
    lat: -0.303,
    lng: 36.08,
  },
  {
    id: 2,
    name: "Healthy Goat",
    type: "Goat",
    health: "Healthy",
    county: "Kiambu",
    owner: "Jane",
    lat: -1.016,
    lng: 37.852,
  },
  {
    id: 3,
    name: "Treatment Sheep",
    type: "Sheep",
    health: "Under Treatment",
    county: "Nakuru",
    owner: "John",
    lat: -0.303,
    lng: 36.08,
  },
  {
    id: 4,
    name: "Sick Cow 2",
    type: "Cattle",
    health: "Sick",
    county: "Nakuru",
    owner: "Mike",
    lat: -0.305,
    lng: 36.082,
  },
  {
    id: 5,
    name: "Sick Cow 3",
    type: "Cattle",
    health: "Sick",
    county: "Nakuru",
    owner: "Sarah",
    lat: -0.304,
    lng: 36.081,
  },
];

describe("HealthAlerts", () => {
  it("shows all systems normal when no alerts", () => {
    const healthyData = mockData.filter(
      (animal) => animal.health === "Healthy"
    );
    render(<HealthAlerts data={healthyData} />);

    expect(screen.getByText(/all systems normal/i)).toBeInTheDocument();
    expect(screen.getByText(/no critical health alerts/i)).toBeInTheDocument();
  });

  it("shows critical alert for sick animals", () => {
    render(<HealthAlerts data={mockData} />);

    expect(
      screen.getByText(/sick animals require immediate attention/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/these animals need urgent veterinary care/i)
    ).toBeInTheDocument();
  });

  it("shows warning alert for animals under treatment", () => {
    render(<HealthAlerts data={mockData} />);

    expect(screen.getByText(/animals under treatment/i)).toBeInTheDocument();
  });

  it("detects potential disease outbreaks", () => {
    render(<HealthAlerts data={mockData} />);

    expect(
      screen.getByText(/potential disease outbreak in nakuru/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/3 sick animals detected/i)).toBeInTheDocument();
  });

  it("allows dismissing alerts", () => {
    render(<HealthAlerts data={mockData} />);

    const dismissButtons = screen.getAllByRole("button", { name: /dismiss/i });
    fireEvent.click(dismissButtons[0]);

    // Alert should be removed from view
    expect(
      screen.queryByText(/sick animals require immediate attention/i)
    ).not.toBeInTheDocument();
  });

  it("shows correct alert types with appropriate styling", () => {
    render(<HealthAlerts data={mockData} />);

    // Critical alerts should have red styling
    const criticalAlert = screen
      .getByText(/sick animals require immediate attention/i)
      .closest(".card");
    expect(criticalAlert).toHaveClass("bg-red-50");

    // Warning alerts should have yellow styling
    const warningAlert = screen
      .getByText(/animals under treatment/i)
      .closest(".card");
    expect(warningAlert).toHaveClass("bg-yellow-50");
  });

  it("provides action buttons for critical alerts", () => {
    render(<HealthAlerts data={mockData} />);

    expect(
      screen.getByRole("button", { name: /report to kalro/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /view.*affected animals/i })
    ).toBeInTheDocument();
  });
});
