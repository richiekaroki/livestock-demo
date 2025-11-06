// src/test/integration/routing.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../App";

// Mock window.matchMedia
beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Clear localStorage to ensure consistent state
  localStorage.clear();
});

// Mock the API calls
vi.mock("../../services/mockApi", () => {
  const mockAnimals = [
    {
      id: 1,
      name: "Test Animal",
      type: "Cattle" as const,
      health: "Healthy" as const,
      county: "Nakuru",
      owner: "Test",
      lat: -0.303099,
      lng: 36.080025,
    },
  ];

  return {
    mockAPI: {
      getAnimals: vi.fn().mockResolvedValue({
        success: true,
        data: mockAnimals,
        total: 1,
        page: 1,
        limit: 50,
      }),
      getAnimalStatistics: vi.fn().mockResolvedValue({
        success: true,
        data: {
          totalAnimals: 1,
          healthyCount: 1,
          sickCount: 0,
          underTreatmentCount: 0,
          recoveredCount: 0,
          counties: 1,
          lastUpdated: new Date().toISOString(),
        },
      }),
      createAnimal: vi.fn(),
    },
  };
});

describe("Routing Integration", () => {
  it("should navigate between Dashboard and MapView", async () => {
    const user = userEvent.setup();

    // Render the App directly (it has its own Router)
    render(<App />);

    // Wait for the loading to finish and Dashboard to appear
    // Use a more flexible text matcher
    await waitFor(
      () => {
        expect(
          screen.getByText(/Livestock Overview|Loading livestock data/)
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // If we're still loading, wait a bit more
    if (screen.queryByText("Loading livestock data...")) {
      await waitFor(
        () => {
          expect(
            screen.queryByText("Loading livestock data...")
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    }

    // Now we should be on the Dashboard
    expect(screen.getByText("Livestock Overview")).toBeInTheDocument();

    // Navigate to Map View - look for the navigation link
    const mapViewLink =
      screen.getByRole("link", { name: /map view/i }) ||
      screen.getByText("Map View");
    await user.click(mapViewLink);

    // Verify MapView is shown
    await waitFor(
      () => {
        expect(screen.getByText("Livestock Map")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Navigate back to Dashboard
    const dashboardLink =
      screen.getByRole("link", { name: /dashboard/i }) ||
      screen.getByText("Dashboard");
    await user.click(dashboardLink);

    // Verify Dashboard is shown again
    await waitFor(
      () => {
        expect(screen.getByText("Livestock Overview")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should load Dashboard by default", async () => {
    render(<App />);

    // Wait for Dashboard content - be more specific
    await waitFor(
      () => {
        // Use a more specific selector for the main dashboard heading
        expect(
          screen.getByRole("heading", { name: "Livestock Overview" })
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Verify we're on the Dashboard page with specific content
    expect(screen.getByText("Register New Animal")).toBeInTheDocument();
    expect(screen.getByText("Filter Animals")).toBeInTheDocument();
  });
});
