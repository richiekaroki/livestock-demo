// src/utils/__tests__/biometrics.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildBiometricData, capturePhoto, hashPhoto } from "../biometrics";

describe("hashPhoto", () => {
  it("produces a 64-char hex digest", async () => {
    const hash = await hashPhoto("data:image/jpeg;base64,AAAA");

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same input", async () => {
    const input = "data:image/jpeg;base64,AAAA";

    expect(await hashPhoto(input)).toBe(await hashPhoto(input));
  });

  it("differs for different inputs", async () => {
    expect(await hashPhoto("photo-a")).not.toBe(await hashPhoto("photo-b"));
  });
});

describe("buildBiometricData", () => {
  it("builds a full biometric record", () => {
    const data = buildBiometricData({
      biometricType: "nose_print",
      photo: "data:image/jpeg;base64,AAAA",
      hash: "abc123",
      location: { lat: -0.3, lng: 36.08 },
      confidence: 0.9,
      deviceId: "web-camera",
      capturedBy: "Jane",
    });

    expect(data.biometricType).toBe("nose_print");
    expect(data.nosePrintHash).toBe("abc123");
    expect(data.animalPhoto).toBe("data:image/jpeg;base64,AAAA");
    expect(data.captureLocation).toEqual({ lat: -0.3, lng: 36.08 });
    expect(data.confidence).toBe(0.9);
    expect(data.deviceId).toBe("web-camera");
    expect(data.capturedBy).toBe("Jane");
    expect(data.captureTimestamp).toBeDefined();
  });

  it("omits optional hash when not provided", () => {
    const data = buildBiometricData({
      biometricType: "visual",
      photo: "photo",
    });

    expect(data.nosePrintHash).toBeUndefined();
    expect(data.captureLocation).toEqual({ lat: 0, lng: 0 });
    expect(data.confidence).toBe(0.85);
  });
});

describe("capturePhoto", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws a clear error when the camera API is unavailable", async () => {
    vi.stubGlobal("navigator", { mediaDevices: undefined });

    await expect(capturePhoto()).rejects.toThrow("Camera not available");
  });

  it("propagates a permission denial", async () => {
    const mediaDevices = {
      getUserMedia: vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError")),
    };
    vi.stubGlobal("navigator", { mediaDevices });

    await expect(capturePhoto()).rejects.toThrow();
    expect(mediaDevices.getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({ video: expect.any(Object) })
    );
  });
});
