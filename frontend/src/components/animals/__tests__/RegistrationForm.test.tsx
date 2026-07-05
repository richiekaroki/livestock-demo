// src/components/animals/__tests__/RegistrationForm.test.tsx
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RegistrationForm from "../RegistrationForm";

vi.mock("../../../store/livestockStore", () => ({
  useLivestockStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      addAnimal: vi.fn().mockResolvedValue(undefined),
    }),
}));

const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};
Object.defineProperty(navigator, "geolocation", {
  value: mockGeolocation,
  writable: true,
});

describe("RegistrationForm", () => {
  const mockOnAnimalAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockGeolocation.getCurrentPosition.mockImplementation(
      (success: (pos: { coords: { latitude: number; longitude: number; accuracy: number; altitude: null; altitudeAccuracy: null; heading: null; speed: null }; timestamp: number }) => void) => {
        success({
          coords: {
            latitude: -1.29,
            longitude: 36.82,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper: find form inputs by their label text using container queries
  function getFormInputs(form: HTMLElement) {
    const labels = within(form).getAllByText(/.+/);
    const inputs: Record<string, HTMLElement> = {};

    for (const label of labels) {
      const text = label.textContent?.trim();
      if (!text) continue;
      // Find the next sibling input/select
      const nextEl = label.nextElementSibling;
      if (nextEl && (nextEl.tagName === "INPUT" || nextEl.tagName === "SELECT")) {
        inputs[text] = nextEl as HTMLElement;
      }
    }
    return inputs;
  }

  it("renders form with all fields", () => {
    const { container } = render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    const form = container.querySelector("form")!;
    expect(screen.getByText("Register New Animal")).toBeInTheDocument();
    const inputs = getFormInputs(form);
    expect(inputs["Animal Name"]).toBeDefined();
    expect(inputs["Animal Type"]).toBeDefined();
    expect(inputs["County"]).toBeDefined();
    expect(inputs["Owner Name"]).toBeDefined();
    expect(inputs["Health Status"]).toBeDefined();
  });

  it("renders submit button", () => {
    render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    expect(screen.getByRole("button", { name: /Register Animal/ })).toBeInTheDocument();
  });

  it("allows typing in animal name", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    const form = container.querySelector("form")!;
    const inputs = getFormInputs(form);
    await user.type(inputs["Animal Name"], "Test Cow");
    expect(inputs["Animal Name"]).toHaveValue("Test Cow");
  });

  it("allows typing in owner name", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    const form = container.querySelector("form")!;
    const inputs = getFormInputs(form);
    await user.type(inputs["Owner Name"], "John Doe");
    expect(inputs["Owner Name"]).toHaveValue("John Doe");
  });

  it("allows selecting animal type", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    const form = container.querySelector("form")!;
    const inputs = getFormInputs(form);
    await user.selectOptions(inputs["Animal Type"], "Goat");
    expect(inputs["Animal Type"]).toHaveValue("Goat");
  });

  it("allows selecting county", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    const form = container.querySelector("form")!;
    const inputs = getFormInputs(form);
    await user.selectOptions(inputs["County"], "Kiambu");
    expect(inputs["County"]).toHaveValue("Kiambu");
  });

  it("allows selecting health status", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    const form = container.querySelector("form")!;
    const inputs = getFormInputs(form);
    await user.selectOptions(inputs["Health Status"], "Sick");
    expect(inputs["Health Status"]).toHaveValue("Sick");
  });

  it("shows biometric toggle button", () => {
    render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    expect(screen.getByText("Show Biometric Capture")).toBeInTheDocument();
  });

  it("toggles biometric capture section", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    await user.click(screen.getByText("Show Biometric Capture"));
    expect(screen.getByText("Hide Biometric Capture")).toBeInTheDocument();
  });

  it("validates required fields have required attribute", () => {
    const { container } = render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    const form = container.querySelector("form")!;
    const inputs = getFormInputs(form);
    expect(inputs["Animal Name"]).toBeRequired();
    expect(inputs["Owner Name"]).toBeRequired();
  });

  it("calls onAnimalAdded callback after successful submission", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    const form = container.querySelector("form")!;
    const inputs = getFormInputs(form);

    await user.type(inputs["Animal Name"], "Test Cow");
    await user.type(inputs["Owner Name"], "Test Owner");
    await user.click(screen.getByRole("button", { name: /Register Animal/ }));

    await waitFor(() => {
      expect(mockOnAnimalAdded).toHaveBeenCalled();
    });
  });

  it("shows success message after registration", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);
    const form = container.querySelector("form")!;
    const inputs = getFormInputs(form);

    await user.type(inputs["Animal Name"], "Test Cow");
    await user.type(inputs["Owner Name"], "Test Owner");
    await user.click(screen.getByRole("button", { name: /Register Animal/ }));

    await waitFor(() => {
      expect(screen.getByText("Test Cow registered successfully!")).toBeInTheDocument();
    });
  });
});
