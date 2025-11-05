// src/components/animals/RegistrationForm.tsx - FIXED VERSION
import { useState } from "react";
import { mockAPI } from "../../services/mockApi"; 
import type { Livestock } from "../../types";
import { validateLivestock } from "../../utils/validation";
import BiometricCapture, { type BiometricData } from "./BiometricCapture";

interface RegistrationFormProps {
  data: Livestock[];
  onAnimalAdded: () => void;
}

export default function RegistrationForm({
  onAnimalAdded,
}: RegistrationFormProps) {
  // Form fields
  const [name, setName] = useState("");
  const [type, setType] = useState("Cattle");
  const [county, setCounty] = useState("Nakuru");
  const [owner, setOwner] = useState("");
  const [health, setHealth] = useState("Healthy");

  // Biometric data
  const [biometricData, setBiometricData] = useState<BiometricData | null>(
    null
  );
  const [showBiometric, setShowBiometric] = useState(false);

  //  NEW: UI states for feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // Create animal data object
    const animalData = {
      name,
      type: type as Livestock["type"],
      county,
      owner,
      health: health as Livestock["health"],
      lat: -0.303099, // In production, get from GPS or county center
      lng: 36.080025,
      ...(biometricData && { biometricData }),
    };

    try {
      //  Validate data
      const validationErrors = validateLivestock(animalData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(", "));
        setIsSubmitting(false);
        return;
      }

      //  Add to API
      console.log("Registering animal:", animalData);
      const response = await mockAPI.createAnimal(animalData);

      if (response.success) {
        //  Show success message
        setSuccessMessage(` ${name} registered successfully!`);

        //  Refresh parent data
        onAnimalAdded();

        //  Reset form after 2 seconds
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
      } else {
        setError(response.error || "Failed to register animal");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to register animal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricCapture = (data: BiometricData) => {
    setBiometricData(data);
    console.log("Biometric data captured:", data);
  };

  return (
    <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        Register New Animal
      </h2>

      {/* Basic Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Animal Name
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="Enter animal name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Animal Type
          </label>
          <select
            className="input-field"
            value={type}
            onChange={(e) => setType(e.target.value)}
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            County
          </label>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Owner Name
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="Enter owner name"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Health Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Health Status
        </label>
        <select
          className="input-field"
          value={health}
          onChange={(e) => setHealth(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="Healthy">Healthy</option>
          <option value="Sick">Sick</option>
          <option value="Under Treatment">Under Treatment</option>
          <option value="Recovered">Recovered</option>
        </select>
      </div>

      {/* Biometric Capture Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
            Biometric Identification (Optional)
          </h3>
          <button
            type="button"
            onClick={() => setShowBiometric(!showBiometric)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
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

        {/* Biometric Status Indicator */}
        {biometricData && (
          <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
            <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
              <span></span>
              <span>
                Biometric data captured (
                {(biometricData.confidence * 100).toFixed(1)}% confidence)
              </span>
            </div>
          </div>
        )}
      </div>

      {/*  NEW: Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md animate-fadeIn">
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-red-800 dark:text-red-300">
              <strong className="font-semibold">Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/*  NEW: Success Message */}
      {successMessage && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md animate-fadeIn">
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-green-800 dark:text-green-300 font-medium">
              {successMessage}
            </div>
          </div>
        </div>
      )}

      {/*  Submit Button with Loading State */}
      <button
        type="submit"
        className={`btn btn-primary w-full md:w-auto ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Registering...
          </span>
        ) : (
          "Register Animal"
        )}
      </button>

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        <strong>Note:</strong> Biometric capture helps prevent duplicate
        registrations and enables accurate animal identification for insurance
        and traceability.
      </div>
    </form>
  );
}
