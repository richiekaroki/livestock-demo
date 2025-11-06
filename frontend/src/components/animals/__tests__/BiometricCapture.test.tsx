// src/components/animals/__tests__/BiometricCapture.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BiometricCapture from "../BiometricCapture";

describe("BiometricCapture", () => {
  const mockOnCapture = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with correct animal type", () => {
    render(<BiometricCapture onCapture={mockOnCapture} animalType="Cattle" />);

    expect(screen.getByText(/cattle biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/nose print recognition/i)).toBeInTheDocument();
  });

  it("shows different methods for different animal types", () => {
    const { rerender } = render(
      <BiometricCapture onCapture={mockOnCapture} animalType="Goat" />
    );
    expect(screen.getByText(/ear tag ocr/i)).toBeInTheDocument();

    rerender(<BiometricCapture onCapture={mockOnCapture} animalType="Camel" />);
    expect(screen.getByText(/hump pattern/i)).toBeInTheDocument();
  });

  it("captures biometric data and calls onCapture", async () => {
    render(<BiometricCapture onCapture={mockOnCapture} animalType="Cattle" />);

    const captureButton = screen.getByRole("button", {
      name: /capture cattle biometrics/i,
    });
    fireEvent.click(captureButton);

    // Should show loading state
    expect(screen.getByText(/processing/i)).toBeInTheDocument();

    // Advance timers to simulate capture process
    await vi.advanceTimersByTimeAsync(2500);

    await waitFor(() => {
      expect(mockOnCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          biometricType: "nose_print",
          confidence: expect.any(Number),
          qualityScore: expect.any(Number),
          nosePrintHash: expect.stringContaining("NOSE-"),
        })
      );
    });

    // Should show success message
    expect(
      screen.getByText(/biometric capture successful/i)
    ).toBeInTheDocument();
  });

  it("disables button during capture", async () => {
    render(<BiometricCapture onCapture={mockOnCapture} animalType="Cattle" />);

    const captureButton = screen.getByRole("button", {
      name: /capture cattle biometrics/i,
    });
    fireEvent.click(captureButton);

    expect(captureButton).toBeDisabled();
    expect(captureButton).toHaveTextContent(/processing/i);

    await vi.advanceTimersByTimeAsync(2500);

    await waitFor(() => {
      expect(captureButton).not.toBeDisabled();
      expect(captureButton).toHaveTextContent(/capture cattle biometrics/i);
    });
  });

  it("generates different biometric data for different methods", async () => {
    render(<BiometricCapture onCapture={mockOnCapture} animalType="Goat" />);

    const captureButton = screen.getByRole("button", {
      name: /capture goat biometrics/i,
    });
    fireEvent.click(captureButton);

    await vi.advanceTimersByTimeAsync(1800); // Goat capture is faster

    await waitFor(() => {
      expect(mockOnCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          biometricType: "ear_tag",
          earTagPhoto: expect.stringContaining("data:image/svg+xml"),
        })
      );
    });
  });

  it("displays confidence and quality scores", async () => {
    render(<BiometricCapture onCapture={mockOnCapture} animalType="Cattle" />);

    const captureButton = screen.getByRole("button", {
      name: /capture cattle biometrics/i,
    });
    fireEvent.click(captureButton);
    await vi.advanceTimersByTimeAsync(2500);

    await waitFor(() => {
      expect(screen.getByText(/% confidence/i)).toBeInTheDocument();
      expect(screen.getByText(/% quality score/i)).toBeInTheDocument();
    });
  });
});
