// src/components/animals/__tests__/RegistrationForm.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RegistrationForm from "../RegistrationForm";

// Properly mock the entire module
vi.mock("../../../services/mockApi", () => ({
  mockAPI: {
    createAnimal: vi.fn(), // This creates a proper mock function
  },
}));

// Mock BiometricCapture properly
vi.mock("../BiometricCapture", () => ({
  default: ({ onCapture, animalType }: any) => (
    <div data-testid="biometric-capture">
      Biometric Capture for {animalType}
      <button
        onClick={() =>
          onCapture({
            nosePrintHash: "test-hash-123",
            confidence: 0.95,
            captureTimestamp: new Date().toISOString(),
            gpsLocation: { lat: -0.303, lng: 36.08 },
            biometricType: "nose_print" as const,
            qualityScore: 0.92,
            captureLocation: { lat: -0.303, lng: 36.08 },
            earTagPhoto: null,
            facialRecognitionHash: null,
          })
        }
      >
        Simulate Capture
      </button>
    </div>
  ),
}));

const mockOnAnimalAdded = vi.fn();

describe("RegistrationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(<RegistrationForm data={[]} onAnimalAdded={mockOnAnimalAdded} />);

    expect(screen.getByLabelText(/animal name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/animal type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/county/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/health status/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register animal/i })
    ).toBeInTheDocument();
  });

  it("validates required fields on submit", async () => {
    render(<RegistrationForm data={[]} onAnimalAdded={mockOnAnimalAdded} />);

    const submitButton = screen.getByRole("button", {
      name: /register animal/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error:/i)).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    // Import and cast the mock properly
    const { mockAPI } = await import("../../../services/mockApi");
    const mockCreateAnimal = mockAPI.createAnimal as ReturnType<typeof vi.fn>;
    mockCreateAnimal.mockResolvedValue({ success: true, data: {} as any });

    render(<RegistrationForm data={[]} onAnimalAdded={mockOnAnimalAdded} />);

    await userEvent.type(screen.getByLabelText(/animal name/i), "Test Cow");
    await userEvent.selectOptions(
      screen.getByLabelText(/animal type/i),
      "Cattle"
    );
    await userEvent.type(screen.getByLabelText(/owner name/i), "John Doe");

    fireEvent.click(screen.getByRole("button", { name: /register animal/i }));

    await waitFor(() => {
      expect(mockCreateAnimal).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Cow",
          type: "Cattle",
          owner: "John Doe",
          county: "Nakuru",
          health: "Healthy",
        })
      );
    });
  });

  it("handles biometric capture integration", async () => {
    render(<RegistrationForm data={[]} onAnimalAdded={mockOnAnimalAdded} />);

    const showBiometricButton = screen.getByText(/show biometric capture/i);
    fireEvent.click(showBiometricButton);

    expect(screen.getByTestId("biometric-capture")).toBeInTheDocument();

    const captureButton = screen.getByText(/simulate capture/i);
    fireEvent.click(captureButton);

    await waitFor(() => {
      expect(screen.getByText(/biometric data captured/i)).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    const { mockAPI } = await import("../../../services/mockApi");
    const mockCreateAnimal = mockAPI.createAnimal as ReturnType<typeof vi.fn>;
    mockCreateAnimal.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, data: {} as any }), 100)
        )
    );

    render(<RegistrationForm data={[]} onAnimalAdded={mockOnAnimalAdded} />);

    await userEvent.type(screen.getByLabelText(/animal name/i), "Test Cow");
    await userEvent.type(screen.getByLabelText(/owner name/i), "John Doe");

    fireEvent.click(screen.getByRole("button", { name: /register animal/i }));

    expect(screen.getByText(/registering.../i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows success message on successful registration", async () => {
    const { mockAPI } = await import("../../../services/mockApi");
    const mockCreateAnimal = mockAPI.createAnimal as ReturnType<typeof vi.fn>;
    mockCreateAnimal.mockResolvedValue({ success: true, data: {} as any });

    render(<RegistrationForm data={[]} onAnimalAdded={mockOnAnimalAdded} />);

    await userEvent.type(screen.getByLabelText(/animal name/i), "Test Cow");
    await userEvent.type(screen.getByLabelText(/owner name/i), "John Doe");
    fireEvent.click(screen.getByRole("button", { name: /register animal/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/test cow registered successfully!/i)
      ).toBeInTheDocument();
      expect(mockOnAnimalAdded).toHaveBeenCalled();
    });
  });

  it("handles API errors gracefully", async () => {
    const { mockAPI } = await import("../../../services/mockApi");
    const mockCreateAnimal = mockAPI.createAnimal as ReturnType<typeof vi.fn>;
    mockCreateAnimal.mockResolvedValue({
      success: false,
      error: "Database connection failed",
      data: {} as any,
    });

    render(<RegistrationForm data={[]} onAnimalAdded={mockOnAnimalAdded} />);

    await userEvent.type(screen.getByLabelText(/animal name/i), "Test Cow");
    await userEvent.type(screen.getByLabelText(/owner name/i), "John Doe");
    fireEvent.click(screen.getByRole("button", { name: /register animal/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/database connection failed/i)
      ).toBeInTheDocument();
    });
  });
});
