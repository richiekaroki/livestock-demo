// src/components/animals/RegistrationForm.tsx

// RegistrationForm.tsx
import { useState } from "react";
import type { Livestock } from "../../types";

interface RegistrationFormProps {
  data: Livestock[];
  onAnimalAdded: () => void;
}

export default function RegistrationForm({
  onAnimalAdded,
}: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [county, setCounty] = useState("");
  const [owner, setOwner] = useState("");
  const [health, setHealth] = useState("Healthy");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock add - replace with actual API call
    console.log({ name, type, county, owner, health });
    onAnimalAdded();
    setName("");
    setType("");
    setCounty("");
    setOwner("");
    setHealth("Healthy");
  };

  return (
    <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        Add New Livestock
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="input-field"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="text"
          placeholder="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="text"
          placeholder="County"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="text"
          placeholder="Owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          required
        />
      </div>

      <select
        className="input-field"
        value={health}
        onChange={(e) => setHealth(e.target.value)}
      >
        <option>Healthy</option>
        <option>Critical</option>
        <option>Recovering</option>
      </select>

      <button type="submit" className="btn btn-blue w-full md:w-auto">
        Add Livestock
      </button>
    </form>
  );
}
