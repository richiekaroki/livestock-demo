// src/components/animals/__tests__/RegistrationForm.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import RegistrationForm from "../RegistrationForm";

vi.mock("../BiometricCapture", () => ({
  default: ({ onCapture }: { onCapture: (d: unknown) => void }) => (
    <div data-testid="biometric-capture">
      <button type="button" onClick={() => onCapture({ hoofPrint: "test", muzzlePrint: "test" })}>
        Capture
      </button>
    </div>
  ),
}));

vi.mock("../ui/VoiceInput", () => ({
  default: ({ onTranscript }: { onTranscript: (t: string) => void }) => (
    <button type="button" onClick={() => onTranscript("voice input")}>
      Voice
    </button>
  ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

describe("RegistrationForm", () => {
  const onAnimalAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with all fields", () => {
    render(<RegistrationForm onAnimalAdded={onAnimalAdded} />);
    expect(screen.getByText("Register New Animal")).toBeInTheDocument();
    expect(screen.getByLabelText("Animal Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Animal Type")).toBeInTheDocument();
    expect(screen.getByLabelText("County")).toBeInTheDocument();
    expect(screen.getByLabelText("Owner Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Health Status")).toBeInTheDocument();
  });

  it("allows typing in animal name", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onAnimalAdded={onAnimalAdded} />);
    const input = screen.getByLabelText("Animal Name");
    await user.type(input, "Test Cow");
    expect(input).toHaveValue("Test Cow");
  });

  it("allows typing in owner name", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onAnimalAdded={onAnimalAdded} />);
    const input = screen.getByLabelText("Owner Name");
    await user.type(input, "John Doe");
    expect(input).toHaveValue("John Doe");
  });

  it("validates required fields have required attribute", () => {
    render(<RegistrationForm onAnimalAdded={onAnimalAdded} />);
    expect(screen.getByLabelText("Animal Name")).toBeRequired();
    expect(screen.getByLabelText("Owner Name")).toBeRequired();
  });

  it("has submit button", () => {
    render(<RegistrationForm onAnimalAdded={onAnimalAdded} />);
    expect(screen.getByRole("button", { name: /Register Animal/i })).toBeInTheDocument();
  });
});
