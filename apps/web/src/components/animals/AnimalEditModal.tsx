// src/components/animals/AnimalEditModal.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import type { Livestock } from "@wam-mfugo/shared";
import { KENYA_COUNTIES, LIVESTOCK_TYPES } from "@wam-mfugo/shared";
import { backend } from "../../services/backend";

interface AnimalEditModalProps {
  animal: Livestock | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AnimalEditModal({
  animal,
  onClose,
  onSaved,
}: AnimalEditModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<Livestock["type"]>("Cattle");
  const [breed, setBreed] = useState("");
  const [county, setCounty] = useState("");
  const [owner, setOwner] = useState("");
  const [health, setHealth] = useState<Livestock["health"]>("Healthy");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (animal) {
      setName(animal.name);
      setType(animal.type);
      setBreed(animal.breed ?? "");
      setCounty(animal.county);
      setOwner(animal.owner);
      setHealth(animal.health);
      setError(null);
    }
  }, [animal]);

  useEffect(() => {
    if (!animal) return;
    const previouslyFocused = document.activeElement as HTMLElement;
    titleRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, [animal]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
    if (e.key === "Tab" && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  if (!animal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !owner.trim()) {
      setError("Name and owner are required");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      await backend.updateAnimal(animal.id, {
        name,
        type,
        breed: breed || undefined,
        county,
        owner,
        health,
      });
      onSaved();
    } catch {
      setError("Failed to update animal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <form
        ref={modalRef}
        className="card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" ref={titleRef} tabIndex={-1} className="text-xl font-bold text-text-primary outline-none">
            Edit Animal
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-text-tertiary hover:text-text-primary cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-bg-secondary transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium mb-1.5 text-text-secondary">Animal Name</label>
            <input
              id="edit-name"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="edit-type" className="block text-sm font-medium mb-1.5 text-text-secondary">Animal Type</label>
              <select
                id="edit-type"
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
              <label htmlFor="edit-health" className="block text-sm font-medium mb-1.5 text-text-secondary">Health Status</label>
              <select
                id="edit-health"
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
          </div>

          <div>
            <label htmlFor="edit-breed" className="block text-sm font-medium mb-1.5 text-text-secondary">Breed</label>
            <input
              id="edit-breed"
              className="input-field"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Optional"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="edit-county" className="block text-sm font-medium mb-1.5 text-text-secondary">County</label>
            <select
              id="edit-county"
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
            <label htmlFor="edit-owner" className="block text-sm font-medium mb-1.5 text-text-secondary">Owner Name</label>
            <input
              id="edit-owner"
              className="input-field"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-error/5 border border-error/20 rounded-lg text-error text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-primary ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
