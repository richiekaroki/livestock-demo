// src/utils/biometrics.ts
import type { BiometricData, BiometricType } from "@wam-mfugo/shared";

interface PhotoOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export async function capturePhoto(options: PhotoOptions = {}): Promise<string> {
  const mediaDevices = navigator.mediaDevices;
  if (!mediaDevices?.getUserMedia) {
    throw new Error("Camera not available");
  }

  const stream = await mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
  });

  try {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.setAttribute("playsinline", "");

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load camera stream"));
      video.load();
    });
    await video.play();

    const width = options.width ?? video.videoWidth ?? 640;
    const height = options.height ?? video.videoHeight ?? 480;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context unavailable");
    }
    ctx.drawImage(video, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", options.quality ?? 0.85);
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

export async function hashPhoto(dataUrl: string): Promise<string> {
  const data = new TextEncoder().encode(dataUrl);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

interface BiometricDataOptions {
  biometricType: BiometricType;
  photo: string;
  hash?: string;
  location?: { lat: number; lng: number };
  confidence?: number;
  deviceId?: string;
  capturedBy?: string;
}

export function buildBiometricData(options: BiometricDataOptions): BiometricData {
  return {
    biometricType: options.biometricType,
    ...(options.hash ? { nosePrintHash: options.hash } : {}),
    earTagPhoto: null,
    animalPhoto: options.photo,
    captureTimestamp: new Date().toISOString(),
    captureLocation: options.location ?? { lat: 0, lng: 0 },
    confidence: options.confidence ?? 0.85,
    ...(options.deviceId ? { deviceId: options.deviceId } : {}),
    ...(options.capturedBy ? { capturedBy: options.capturedBy } : {}),
  };
}