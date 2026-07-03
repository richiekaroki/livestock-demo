// src/components/animals/RegistrationForm.tsx

import { useState } from "react";
import type { BiometricData, Livestock } from "../../types";
import { useLivestockStore } from "../../store/livestockStore";
import { validateLivestock } from "../../utils/validation";
import BiometricCapture from "./BiometricCapture";

interface RegistrationFormProps {
  onAnimalAdded: () => void;
}

export default function RegistrationForm({
  onAnimalAdded,
}: RegistrationFormProps) {
  const addAnimal = useLivestockStore((s) => s.addAnimal);

  const [name, setName] = useState("");
  const [type, setType] = useState<Livestock["type"]>("Cattle");
  const [county, setCounty] = useState("Nakuru");
  const [owner, setOwner] = useState("");
  const [health, setHealth] = useState<Livestock["health"]>("Healthy");

  const [biometricData, setBiometricData] = useState<BiometricData | null>(
    null
  );
  const [showBiometric, setShowBiometric] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const coords = await new Promise<{ lat: number; lng: number }>(
      (resolve) => {
        if (!navigator.geolocation) {
          resolve({ lat: -0.303099, lng: 36.080025 });
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({ lat: -0.303099, lng: 36.080025 }),
          { timeout: 3000 }
        );
      }
    );

    const animalData: Omit<Livestock, "id" | "createdAt"> = {
      name,
      type,
      county,
      owner,
      health,
      lat: coords.lat,
      lng: coords.lng,
      ...(biometricData && { biometricData }),
    };

    const validationErrors = validateLivestock(animalData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      setIsSubmitting(false);
      return;
    }

    try {
      await addAnimal(animalData);
      setSuccessMessage(`${name} registered successfully!`);
      onAnimalAdded();

      setTimeout(() => {
        setName("");
        setType("Cattle");
        setCounty("Nakuru");
        setOwner("");
        setHealth("Healthy");
        setBiometricData(null);
        setShowBiometric(false);
        setSuccessMessage(null);
      }, 2000);
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
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        Register New Animal
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Animal Name</label>
          <input
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Animal Type</label>
          <select
            className="input-field"
            value={type}
            onChange={(e) => setType(e.target.value as Livestock["type"])}
            disabled={isSubmitting}
          >
            <option value="Cattle">Cattle</option>
            <option value="Goat">Goat</option>
            <option value="Sheep">Sheep</option>
            <option value="Camel">Camel</option>
            <option value="Pig">Pig</option>
            <option value="Chicken">Chicken</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">County</label>
          <select
            className="input-field"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="Nakuru">Nakuru</option>
            <option value="Kiambu">Kiambu</option>
            <option value="Garissa">Garissa</option>
            <option value="Kajiado">Kajiado</option>
            <option value="Narok">Narok</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Owner Name</label>
          <input
            className="input-field"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Health Status</label>
        <select
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

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between mb-3">
          <h3 className="text-sm font-semibold">
            Biometric Identification (Optional)
          </h3>
          <button
            type="button"
            onClick={() => setShowBiometric(!showBiometric)}
            className="text-xs text-blue-600 hover:underline"
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
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm text-green-800">
              Biometric data captured (
              {(biometricData.confidence * 100).toFixed(1)}% confidence)
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <strong>{successMessage}</strong>
        </div>
      )}

      <button
        type="submit"
        className={`btn btn-primary w-full md:w-auto ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Registering..." : "Register Animal"}
      </button>
    </form>
  );
}
