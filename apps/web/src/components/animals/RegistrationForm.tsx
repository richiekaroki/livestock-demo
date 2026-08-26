// src/components/animals/RegistrationForm.tsx

import { useEffect, useState } from "react";
import type { BiometricData, Farmer, Livestock } from "@wam-mfugo/shared";
import { KENYA_COUNTIES, LIVESTOCK_TYPES } from "@wam-mfugo/shared";
import { useLivestockStore } from "../../store/livestockStore";
import { validateLivestock } from "@wam-mfugo/shared";
import { backend } from "../../services/backend";
import BiometricCapture from "./BiometricCapture";
import VoiceInput from "../ui/VoiceInput";

interface RegistrationFormProps {
  onAnimalAdded: () => void;
}

function getCountyFallback(): string {
  return KENYA_COUNTIES[0]?.name ?? "Nakuru";
}

function getCountyCenter(countyName: string) {
  return KENYA_COUNTIES.find((c) => c.name === countyName);
}

const FALLBACK_COORDS = { lat: -0.303099, lng: 36.080025 };

function getLocationWithFallback(
  countyName: string,
  timeoutMs = 800
): Promise<{ lat: number; lng: number }> {
  const center = getCountyCenter(countyName);
  const fallback = center
    ? { lat: center.lat, lng: center.lng }
    : FALLBACK_COORDS;

  if (!navigator.geolocation) return Promise.resolve(fallback);

  return new Promise<{ lat: number; lng: number }>((resolve) => {
    let settled = false;
    const done = (coords: { lat: number; lng: number }) => {
      if (!settled) {
        settled = true;
        resolve(coords);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => done({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => done(fallback),
      { timeout: 3000, maximumAge: 60000 }
    );

    setTimeout(() => done(fallback), timeoutMs);
  });
}

export default function RegistrationForm({
  onAnimalAdded,
}: RegistrationFormProps) {
  const addAnimal = useLivestockStore((s) => s.addAnimal);

  const [name, setName] = useState("");
  const [type, setType] = useState<Livestock["type"]>("Cattle");
  const [county, setCounty] = useState(getCountyFallback());
  const [owner, setOwner] = useState("");
  const [health, setHealth] = useState<Livestock["health"]>("Healthy");

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | undefined>(
    undefined
  );

  const [biometricData, setBiometricData] = useState<BiometricData | null>(
    null
  );
  const [showBiometric, setShowBiometric] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    backend.getFarmers().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setFarmers(res.data);
      }
    }).catch(() => {});
  }, []);

  const handleFarmerChange = (farmerIdStr: string) => {
    if (!farmerIdStr) {
      setSelectedFarmerId(undefined);
      return;
    }
    const fid = Number(farmerIdStr);
    const farmer = farmers.find((f) => f.id === fid);
    if (farmer) {
      setSelectedFarmerId(farmer.id);
      setOwner(farmer.name);
      if (farmer.county) setCounty(farmer.county);
    }
  };

  const validateFields = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Animal name is required";
    if (!owner.trim()) errors.owner = "Owner name is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!validateFields()) {
      setIsSubmitting(false);
      return;
    }

    const animalData: Omit<Livestock, "id" | "createdAt"> = {
      name,
      type,
      county,
      owner,
      health,
      lat: FALLBACK_COORDS.lat,
      lng: FALLBACK_COORDS.lng,
      ...(selectedFarmerId != null ? { farmerId: selectedFarmerId } : {}),
      ...(biometricData && { biometricData }),
    };

    const validationErrors = validateLivestock(animalData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      setIsSubmitting(false);
      return;
    }

    const coords = await getLocationWithFallback(county);
    animalData.lat = coords.lat;
    animalData.lng = coords.lng;

    try {
      await addAnimal(animalData);
      setSuccessMessage(`${name} registered successfully!`);
      onAnimalAdded();

      // Clear form immediately after successful registration
      setName("");
      setType("Cattle");
      setCounty(getCountyFallback());
      setOwner("");
      setHealth("Healthy");
      setSelectedFarmerId(undefined);
      setBiometricData(null);
      setShowBiometric(false);

      // Dismiss success message after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch {
      setError("Failed to register animal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricCapture = (data: BiometricData) => {
    setBiometricData(data);
  };

  return (
    <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-text-primary">
        Register New Animal
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="animal-name" className="block text-sm font-medium mb-1.5 text-text-secondary">Animal Name</label>
          <div className="flex items-center gap-2">
            <input
              id="animal-name"
              className={`input-field flex-1 ${fieldErrors.name ? "border-error focus:ring-error" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "animal-name-error" : undefined}
            />
            <VoiceInput
              onTranscript={(text) => setName(text.trim())}
              language="en-US"
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.name && (
            <p id="animal-name-error" className="text-xs text-error mt-1">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="animal-type" className="block text-sm font-medium mb-1.5 text-text-secondary">Animal Type</label>
          <select
            id="animal-type"
            className="input-field"
            value={type}
            onChange={(e) => setType(e.target.value as Livestock["type"])}
            disabled={isSubmitting}
          >
            {LIVESTOCK_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="animal-county" className="block text-sm font-medium mb-1.5 text-text-secondary">County</label>
          <select
            id="animal-county"
            className="input-field"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            disabled={isSubmitting}
          >
            {KENYA_COUNTIES.map((c) => (
              <option key={c.code} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="animal-owner" className="block text-sm font-medium mb-1.5 text-text-secondary">Owner Name</label>
          <div className="flex items-center gap-2">
            <input
              id="animal-owner"
              className={`input-field flex-1 ${fieldErrors.owner ? "border-error focus:ring-error" : ""}`}
              value={owner}
              onChange={(e) => {
                setOwner(e.target.value);
                setSelectedFarmerId(undefined);
              }}
              required
              disabled={isSubmitting}
              aria-invalid={!!fieldErrors.owner}
              aria-describedby={fieldErrors.owner ? "animal-owner-error" : undefined}
            />
            <VoiceInput
              onTranscript={(text) => {
                setOwner(text.trim());
                setSelectedFarmerId(undefined);
              }}
              language="en-US"
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.owner && (
            <p id="animal-owner-error" className="text-xs text-error mt-1">{fieldErrors.owner}</p>
          )}
        </div>
      </div>

      {farmers.length > 0 && (
        <div>
          <label htmlFor="animal-farmer" className="block text-sm font-medium mb-1.5 text-text-secondary">
            Farmer (optional — auto-fills owner &amp; county)
          </label>
          <select
            id="animal-farmer"
            className="input-field"
            value={selectedFarmerId ?? ""}
            onChange={(e) => handleFarmerChange(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">— Select farmer —</option>
            {farmers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.code} · {f.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="animal-health" className="block text-sm font-medium mb-1.5 text-text-secondary">Health Status</label>
        <select
          id="animal-health"
          className="input-field"
          value={health}
          onChange={(e) => setHealth(e.target.value as Livestock["health"])}
          disabled={isSubmitting}
        >
          <option value="Healthy">Healthy</option>
          <option value="Sick">Sick</option>
          <option value="Under Treatment">Under Treatment</option>
          <option value="Recovered">Recovered</option>
        </select>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-secondary">
            Biometric Identification (Optional)
          </h3>
          <button
            type="button"
            onClick={() => setShowBiometric(!showBiometric)}
            className="text-xs text-accent hover:text-accent-hover font-medium cursor-pointer min-h-[44px] min-w-[44px]"
            aria-expanded={showBiometric}
            disabled={isSubmitting}
          >
            {showBiometric ? "Hide" : "Show"} Biometric Capture
          </button>
        </div>

        {showBiometric && (
          <BiometricCapture
            onCapture={handleBiometricCapture}
            animalType={type}
          />
        )}

        {biometricData && (
          <div className="mt-3 p-3 bg-success/5 border border-success/20 rounded-lg">
            <div className="text-sm text-success font-medium">
              Biometric data captured (
              {(biometricData.confidence * 100).toFixed(1)}% confidence)
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-error/5 border border-error/20 rounded-lg text-error text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-success/5 border border-success/20 rounded-lg text-success text-sm font-medium">
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        className={`btn btn-primary w-full md:w-auto ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Registering...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Register Animal
          </>
        )}
      </button>
    </form>
  );
}