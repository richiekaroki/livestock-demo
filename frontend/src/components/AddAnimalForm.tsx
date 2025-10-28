// src/components/AddAnimalForm.tsx

import { useState } from "react";
import { mockAPI } from "../services/mockApi";

interface AddAnimalFormProps {
  onAnimalAdded: () => void;
}

export function AddAnimalForm({ onAnimalAdded }: AddAnimalFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Cattle",
    health: "Healthy",
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
    } catch (error) {
      setMessage("❌ Failed to register animal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Register New Animal</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Animal Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Owner Name"
            value={formData.owner}
            onChange={(e) =>
              setFormData({ ...formData, owner: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Cattle">Cattle</option>
            <option value="Goat">Goat</option>
            <option value="Sheep">Sheep</option>
            <option value="Camel">Camel</option>
          </select>

          <select
            value={formData.health}
            onChange={(e) =>
              setFormData({ ...formData, health: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Healthy">Healthy</option>
            <option value="Sick">Sick</option>
            <option value="Under Treatment">Under Treatment</option>
            <option value="Recovered">Recovered</option>
          </select>

          <select
            value={formData.county}
            onChange={(e) =>
              setFormData({ ...formData, county: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Nakuru">Nakuru</option>
            <option value="Kiambu">Kiambu</option>
            <option value="Garissa">Garissa</option>
            <option value="Kajiado">Kajiado</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Registering..." : "Register Animal"}
        </button>

        {message && (
          <p
            className={`text-center p-2 rounded ${
              message.includes("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
