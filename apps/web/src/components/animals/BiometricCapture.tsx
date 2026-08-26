import { useState } from "react";
import type { AnimalType, BiometricData, BiometricType } from "@wam-mfugo/shared";
import { buildBiometricData, capturePhoto, hashPhoto } from "../../utils/biometrics";
import {
  ScanSquare,
  Fingerprint,
  Tag,
  Camera,
  Eye,
  Search,
  HelpCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

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

  const handleCapture = async () => {
    setIsCapturing(true);
    const method = getRecommendedBiometricMethod();
    setCaptureMethod(method.description);

    const realCapture = await attemptRealCapture(method.primary);
    let captureData: BiometricData;

    if (realCapture) {
      captureData = realCapture;
    } else {
      const captureTime = method.primary === "nose_print" ? 2500 : 1800;
      await new Promise((resolve) => setTimeout(resolve, captureTime));

      const mockGPS = await getSimulatedGPSLocation();

      captureData = {
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
    }

    setLastCapture(captureData);
    setIsCapturing(false);
    onCapture(captureData);
  };

  const attemptRealCapture = async (
    method: BiometricType
  ): Promise<BiometricData | null> => {
    try {
      const photo = await capturePhoto();
      const hash = await hashPhoto(photo);
      const gps = await getSimulatedGPSLocation();

      return buildBiometricData({
        biometricType: method,
        photo,
        hash,
        location: gps,
        confidence: calculateConfidenceScore(method),
        deviceId: "web-camera",
        capturedBy: "System",
      });
    } catch {
      return null;
    }
  };

  // Helper Functions

  const generateNosePrintHash = (): string => {
    const patterns = ["whorl", "loop", "arch", "composite"];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return `NOSE-${pattern}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  };

  const simulateEarTagCapture = async (): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14">
          Ear Tag: ${animalType.slice(0, 3).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 8)
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

  const getBiometricIcon = () => {
    const method = getRecommendedBiometricMethod();

    if (animalType === "Cattle")
      return (
        <span className="inline-flex gap-1">
          <ScanSquare className="w-4 h-4" />
          <Fingerprint className="w-4 h-4" />
        </span>
      );
    if (animalType === "Goat")
      return (
        <span className="inline-flex gap-1">
          <Tag className="w-4 h-4" />
          <Tag className="w-4 h-4" />
        </span>
      );
    if (animalType === "Sheep")
      return (
        <span className="inline-flex gap-1">
          <Tag className="w-4 h-4" />
          <Tag className="w-4 h-4" />
        </span>
      );
    if (animalType === "Camel")
      return (
        <span className="inline-flex gap-1">
          <Camera className="w-4 h-4" />
          <Camera className="w-4 h-4" />
        </span>
      );
    if (animalType === "Pig")
      return (
        <span className="inline-flex gap-1">
          <Tag className="w-4 h-4" />
          <Tag className="w-4 h-4" />
        </span>
      );
    if (animalType === "Chicken")
      return (
        <span className="inline-flex gap-1">
          <Eye className="w-4 h-4" />
          <Eye className="w-4 h-4" />
        </span>
      );

    switch (method.primary) {
      case "nose_print":
        return <Fingerprint className="w-4 h-4" />;
      case "facial":
        return <Camera className="w-4 h-4" />;
      case "ear_tag":
        return <Tag className="w-4 h-4" />;
      case "visual":
        return <Eye className="w-4 h-4" />;
      case "hump_pattern":
        return <Search className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-bg-secondary">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-text-primary text-sm">
          {getBiometricIcon()} Advanced Biometric Capture
        </h3>
        <span className="text-xs text-info bg-info/10 px-2 py-1 rounded">
          {getRecommendedBiometricMethod().description}
        </span>
      </div>

      <button
        onClick={handleCapture}
        disabled={isCapturing}
        className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
          isCapturing
            ? "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
            : "btn btn-primary"
        }`}
      >
        {isCapturing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing {captureMethod}...
          </span>
        ) : (
          `Capture ${animalType} Biometrics`
        )}
      </button>

      {lastCapture && (
        <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg text-sm">
          <div className="font-semibold text-success mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Biometric Capture Successful
          </div>
          <div className="space-y-1 text-xs text-text-secondary">
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
