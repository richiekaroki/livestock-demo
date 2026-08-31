// src/camera.ts — real camera biometric capture + SHA-256 hashing
import * as Crypto from "expo-crypto";
import * as Location from "expo-location";
import type { CameraView } from "expo-camera";
import type { BiometricData, BiometricType } from "@wam-mfugo/shared";

async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return { lat: 0, lng: 0 };
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch {
    return { lat: 0, lng: 0 };
  }
}

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

  const captureLocation = await getCurrentLocation();

  return {
    biometricType: "visual" as BiometricType,
    nosePrintHash,
    earTagPhoto: null,
    animalPhoto: dataUrl,
    captureTimestamp: new Date().toISOString(),
    captureLocation,
    confidence: 0.85,
    deviceId: "mobile-camera",
    capturedBy: "System",
  };
}