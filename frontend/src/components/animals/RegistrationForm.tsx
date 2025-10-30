// src/components/animals/RegistrationForm.tsx

import { useState } from "react";
import { mockAPI } from "../../services/mockApi";

interface RegistrationFormProps {
  onAnimalAdded: () => void;
}

type AnimalType = "Cattle" | "Goat" | "Sheep" | "Camel" | "Pig" | "Chicken";
type HealthStatus = "Healthy" | "Sick" | "Under Treatment" | "Recovered";

export default function RegistrationForm({
  onAnimalAdded,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Cattle" as AnimalType,
    health: "Healthy" as HealthStatus,
    county: "Nakuru",
    owner: "",
    lat: -0.303099,
    lng: 36.080025,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await mockAPI.createAnimal(formData);
      if (result.success) {
        setMessage("✅ Animal registered successfully!");
        setFormData({
          name: "",
          type: "Cattle",
          health: "Healthy",
          county: "Nakuru",
          owner: "",
          lat: -0.303099,
          lng: 36.080025,
        });
        onAnimalAdded();
      }
    } catch {
      setMessage("❌ Failed to register animal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">
        Register New Animal
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animal Name
            </label>
            <input
              type="text"
              placeholder="Enter animal name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name
            </label>
            <input
              type="text"
              placeholder="Enter owner name"
              value={formData.owner}
              onChange={(e) =>
                setFormData({ ...formData, owner: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animal Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as AnimalType })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Status
            </label>
            <select
              value={formData.health}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  health: e.target.value as HealthStatus,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="Healthy">Healthy</option>
              <option value="Sick">Sick</option>
              <option value="Under Treatment">Under Treatment</option>
              <option value="Recovered">Recovered</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              County
            </label>
            <select
              value={formData.county}
              onChange={(e) =>
                setFormData({ ...formData, county: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="Nakuru">Nakuru</option>
              <option value="Kiambu">Kiambu</option>
              <option value="Garissa">Garissa</option>
              <option value="Kajiado">Kajiado</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Registering...
            </span>
          ) : (
            "Register Animal"
          )}
        </button>

        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.includes("✅")
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {message.includes("✅") ? "✅" : "❌"}
              </span>
              <span className="font-medium">
                {message.replace(/[✅❌]/g, "").trim()}
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
