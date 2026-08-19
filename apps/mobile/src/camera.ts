// src/camera.ts — real camera biometric capture + SHA-256 hashing
import * as Crypto from "expo-crypto";
import type { CameraView } from "expo-camera";
import type { BiometricData, BiometricType } from "@wam-mfugo/shared";

export async function captureAnimalPhoto(
  cameraRef: CameraView | null
): Promise<BiometricData | null> {
  if (!cameraRef) return null;

  const picture = await cameraRef.takePictureAsync({
    quality: 0.85,
    base64: true,
  });
  if (!picture) return null;

  const dataUrl = picture.base64
    ? `data:image/jpeg;base64,${picture.base64}`
    : picture.uri;

  const nosePrintHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    dataUrl
  );

  return {
    biometricType: "visual" as BiometricType,
    nosePrintHash,
    earTagPhoto: null,
    animalPhoto: dataUrl,
    captureTimestamp: new Date().toISOString(),
    captureLocation: { lat: 0, lng: 0 },
    confidence: 0.85,
    deviceId: "mobile-camera",
    capturedBy: "System",
  };
}