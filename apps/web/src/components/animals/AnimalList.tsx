// src/components/animals/AnimalList.tsx
import { memo, useEffect, useRef, useState } from "react";
import type { Livestock } from "@wam-mfugo/shared";
import { healthBadgeClasses, typeBadgeClasses } from "../../utils/constants";

interface AnimalListProps {
  data: Livestock[];
}

const AnimatedAnimalCard = memo(function AnimatedAnimalCard({
  animal,
  index,
}: {
  animal: Livestock;
  index: number;
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
      className={`card hover-lift p-5 transition-all duration-200 ${
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

      <div className="flex justify-between items-center pt-3 border-t border-border">
        <span className={`badge ${healthBadgeClasses[animal.health]}`}>
          {animal.health}
        </span>
        <span className="text-xs text-text-tertiary font-mono">#{animal.id}</span>
      </div>
    </div>
  );
});

export default function AnimalList({ data }: AnimalListProps) {
  const [prevData, setPrevData] = useState(data);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
        />
      ))}
    </div>
  );
}
