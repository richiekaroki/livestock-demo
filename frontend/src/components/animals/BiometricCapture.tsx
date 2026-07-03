import { useState } from "react";
import type { AnimalType, BiometricData, BiometricType } from "../../types";

interface BiometricCaptureProps {
  onCapture: (data: BiometricData) => void;
  animalType: AnimalType;
}

export default function BiometricCapture({
  onCapture,
  animalType,
}: BiometricCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<BiometricData | null>(null);
  const [captureMethod, setCaptureMethod] = useState<string>("");

  const getRecommendedBiometricMethod = () => {
    const methods = {
      Cattle: {
        primary: "nose_print" as BiometricType,
        secondary: "facial" as BiometricType,
        description: "Nose Print Recognition + Facial Backup",
      },
      Goat: {
        primary: "ear_tag" as BiometricType,
        secondary: "facial" as BiometricType,
        description: "Ear Tag OCR + Facial Recognition",
      },
      Sheep: {
        primary: "ear_tag" as BiometricType,
        secondary: "facial" as BiometricType,
        description: "Ear Tag OCR + Facial Recognition",
      },
      Camel: {
        primary: "facial" as BiometricType,
        secondary: "hump_pattern" as BiometricType,
        description: "Facial Recognition + Hump Pattern",
      },
      Pig: {
        primary: "ear_tag" as BiometricType,
        secondary: "facial" as BiometricType,
        description: "Ear Tag OCR + Facial Recognition",
      },
      Chicken: {
        primary: "visual" as BiometricType,
        secondary: "ear_tag" as BiometricType,
        description: "Visual Identification + Leg Band",
      },
    };

    return (
      methods[animalType as keyof typeof methods] || {
        primary: "facial" as BiometricType,
        secondary: "visual" as BiometricType,
        description: "Visual Identification",
      }
    );
  };

  const simulateAdvancedCapture = async () => {
    setIsCapturing(true);
    const method = getRecommendedBiometricMethod();
    setCaptureMethod(method.description);

    const captureTime = method.primary === "nose_print" ? 2500 : 1800;
    await new Promise((resolve) => setTimeout(resolve, captureTime));

    const mockGPS = await getSimulatedGPSLocation();

    const captureData: BiometricData = {
      biometricType: method.primary,
      nosePrintHash:
        method.primary === "nose_print" ? generateNosePrintHash() : undefined,
      earTagPhoto:
        method.secondary === "ear_tag" ? await simulateEarTagCapture() : null,
      animalPhoto: null,
      captureTimestamp: new Date().toISOString(),
      captureLocation: mockGPS,
      confidence: calculateConfidenceScore(method.primary),
      deviceId: "device-001",
      capturedBy: "System",
    };

    setLastCapture(captureData);
    setIsCapturing(false);
    onCapture(captureData);
    simulateCloudVerification();
  };

  // Helper Functions

  const generateNosePrintHash = (): string => {
    const patterns = ["whorl", "loop", "arch", "composite"];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return `NOSE-${pattern}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substr(2, 8)}`;
  };

  const simulateEarTagCapture = async (): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14">
          Ear Tag: ${animalType.slice(0, 3).toUpperCase()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}
        </text>
      </svg>`
    )}`;
  };

  const getSimulatedGPSLocation = async (): Promise<{
    lat: number;
    lng: number;
  }> => {
    const baseLat = -0.303099;
    const baseLng = 36.080025;
    const accuracy = 0.001 + Math.random() * 0.009;

    return {
      lat: baseLat + (Math.random() - 0.5) * accuracy,
      lng: baseLng + (Math.random() - 0.5) * accuracy,
    };
  };

  const calculateConfidenceScore = (method: BiometricType): number => {
    const baseScores: Record<BiometricType, number> = {
      nose_print: 0.94,
      facial: 0.89,
      ear_tag: 0.82,
      combined: 0.96,
      hump_pattern: 0.87,
      visual: 0.78,
    };

    const baseScore = baseScores[method] ?? 0.85;
    return baseScore + Math.random() * 0.08;
  };

  const simulateCloudVerification = async () => {
    setTimeout(() => {
      // Cloud verification would happen here in production
    }, 3000);
  };

  const getBiometricIcon = () => {
    const method = getRecommendedBiometricMethod();

    if (animalType === "Cattle") return "🐄👃";
    if (animalType === "Goat") return "🐐🏷️";
    if (animalType === "Sheep") return "🐑🏷️";
    if (animalType === "Camel") return "🐫📷";
    if (animalType === "Pig") return "🐖🏷️";
    if (animalType === "Chicken") return "🐔👀";

    switch (method.primary) {
      case "nose_print":
        return "👃";
      case "facial":
        return "📷";
      case "ear_tag":
        return "🏷️";
      case "visual":
        return "👀";
      case "hump_pattern":
        return "🐫";
      default:
        return "🔍";
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
          {getBiometricIcon()} Advanced Biometric Capture
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
          {getRecommendedBiometricMethod().description}
        </span>
      </div>

      <button
        onClick={simulateAdvancedCapture}
        disabled={isCapturing}
        className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all ${
          isCapturing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
        }`}
      >
        {isCapturing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚙️</span>
            Processing {captureMethod}...
          </span>
        ) : (
          `Capture ${animalType} Biometrics`
        )}
      </button>

      {lastCapture && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-sm">
          <div className="font-semibold text-green-800 dark:text-green-300 mb-2">
            ✅ Biometric Capture Successful
          </div>
          <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
            <div>
              <strong>Method:</strong>{" "}
              {lastCapture.biometricType.replace("_", " ").toUpperCase()}
            </div>
            <div>
              <strong>Confidence:</strong>{" "}
              {(lastCapture.confidence * 100).toFixed(1)}%
            </div>
            <div>
              <strong>GPS:</strong> {lastCapture.captureLocation.lat.toFixed(4)}
              , {lastCapture.captureLocation.lng.toFixed(4)}
            </div>
            <div>
              <strong>Time:</strong>{" "}
              {new Date(lastCapture.captureTimestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
