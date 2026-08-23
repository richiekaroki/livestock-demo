import { useState, useCallback } from "react";
import type { Livestock } from "@wam-mfugo/shared";
import { remoteApi } from "../../services/remoteApi";

interface KIAMISRegistrationProps {
  animal: Livestock;
  onSuccess?: (registrationNumber: string) => void;
}

interface RegistrationResult {
  registrationNumber: string;
  qrCode: string;
  message: string;
}

export default function KIAMISRegistration({
  animal,
  onSuccess,
}: KIAMISRegistrationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegistrationResult | null>(null);

  const handleRegister = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await remoteApi.registerWithKIAMIS({
        animalType: animal.type,
        ownerNationalID: "", // Will be validated server-side
        countyCode: animal.county.slice(0, 3).toUpperCase(),
        subCountyCode: "001",
        wardCode: "001",
        biometricHash: animal.biometricData?.nosePrintHash || "N/A",
        gpsCoordinates: { lat: animal.lat, lng: animal.lng },
        timestamp: new Date().toISOString(),
      });

      if (response.success && response.data) {
        const regResult: RegistrationResult = {
          registrationNumber: response.data.animalRegistrationNumber,
          qrCode: response.data.qrCode,
          message: response.data.message,
        };
        setResult(regResult);
        onSuccess?.(regResult.registrationNumber);
      } else {
        setError(response.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [animal, onSuccess]);

  if (result) {
    return (
      <div className="card p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-success">Registered</span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">Registration #:</span>{" "}
            <span className="font-mono">{result.registrationNumber}</span>
          </div>
          <p className="text-xs text-text-tertiary">{result.message}</p>
        </div>

        {result.qrCode && (
          <div className="flex justify-center">
            <img
              src={result.qrCode}
              alt={`QR code for ${result.registrationNumber}`}
              className="w-24 h-24 rounded-lg border border-border"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleRegister}
        disabled={loading}
        className="btn btn-primary text-xs w-full justify-center"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.49-8.49l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.49 8.49l2.83 2.83" />
            </svg>
            Registering...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Register with KIAMIS
          </span>
        )}
      </button>

      {error && (
        <div className="mt-2 p-2 rounded-lg bg-error/10 border border-error/20">
          <p className="text-xs text-error">{error}</p>
        </div>
      )}
    </div>
  );
}
