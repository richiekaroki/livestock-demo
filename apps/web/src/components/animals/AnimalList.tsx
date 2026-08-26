// src/components/animals/AnimalList.tsx
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { Livestock } from "@wam-mfugo/shared";
import { healthBadgeClasses, typeBadgeClasses } from "../../utils/constants";
import AnimalEditModal from "./AnimalEditModal";
import KIAMISRegistration from "./KIAMISRegistration";
import { backend } from "../../services/backend";

interface AnimalListProps {
  data: Livestock[];
  onRefresh?: () => void;
}

const AnimatedAnimalCard = memo(function AnimatedAnimalCard({
  animal,
  index,
  onEdit,
  onDelete,
}: {
  animal: Livestock;
  index: number;
  onEdit: (animal: Livestock) => void;
  onDelete: (animal: Livestock) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`card hover-lift p-5 transition-opacity transition-transform duration-200 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="text-lg font-bold text-text-primary truncate min-w-0">
          {animal.name}
        </h3>
        <span className={`badge ${typeBadgeClasses[animal.type]} flex-shrink-0`}>
          {animal.type}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-text-secondary min-w-0">
          <svg className="w-4 h-4 mr-2 text-text-tertiary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-medium mr-1 flex-shrink-0">County:</span>
          <span className="truncate">{animal.county}</span>
        </div>
        {animal.breed && (
          <div className="flex items-center text-sm text-text-secondary min-w-0">
            <svg className="w-4 h-4 mr-2 text-text-tertiary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span className="font-medium mr-1 flex-shrink-0">Breed:</span>
            <span className="truncate">{animal.breed}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-text-secondary min-w-0">
          <svg className="w-4 h-4 mr-2 text-text-tertiary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="font-medium mr-1 flex-shrink-0">Owner:</span>
          <span className="truncate">{animal.owner}</span>
        </div>
      </div>

      <div className="mt-3">
        <KIAMISRegistration animal={animal} />
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-border">
        <span className={`badge ${healthBadgeClasses[animal.health]}`}>
          {animal.health}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary font-mono mr-2">#{animal.id}</span>
          <button
            onClick={() => onEdit(animal)}
            className="p-2.5 text-text-tertiary hover:text-accent transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent/10"
            aria-label={`Edit ${animal.name}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(animal)}
            className="p-2.5 text-text-tertiary hover:text-error transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-error/10"
            aria-label={`Delete ${animal.name}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export default function AnimalList({ data, onRefresh }: AnimalListProps) {
  const [prevData, setPrevData] = useState(data);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Livestock | null>(null);

  useEffect(() => {
    if (data !== prevData) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setPrevData(data);
        setIsTransitioning(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [data, prevData]);

  const handleDelete = useCallback(
    async (animal: Livestock) => {
      if (!window.confirm(`Are you sure you want to delete ${animal.name}?`)) {
        return;
      }
      try {
        await backend.deleteAnimal(animal.id);
        onRefresh?.();
      } catch {
        window.alert("Failed to delete animal. Please try again.");
      }
    },
    [onRefresh]
  );

  if (!data.length) {
    return (
      <div className="card text-center p-12 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-secondary border border-border flex items-center justify-center">
          <svg className="w-8 h-8 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="text-text-secondary text-lg font-medium mb-1">No animals found</div>
        <div className="text-text-tertiary text-sm">
          Try adjusting your filters or add new animals
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${
          isTransitioning ? "opacity-50" : "opacity-100"
        }`}
      >
        {data.map((animal, index) => (
          <AnimatedAnimalCard
            key={animal.id}
            animal={animal}
            index={isTransitioning ? 0 : index}
            onEdit={setEditingAnimal}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <AnimalEditModal
        animal={editingAnimal}
        onClose={() => setEditingAnimal(null)}
        onSaved={() => {
          setEditingAnimal(null);
          onRefresh?.();
        }}
      />
    </>
  );
}
