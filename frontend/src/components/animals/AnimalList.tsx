// src/components/animals/AnimalList.tsx
import type { Livestock } from "../../types";
import { healthBadgeClasses, typeBadgeClasses } from "../../utils/constants";

interface AnimalListProps {
  data: Livestock[];
}

export default function AnimalList({ data }: AnimalListProps) {
  if (!data.length) {
    return (
      <div className="card text-center p-8">
        <div className="text-text-secondary text-lg">No animals found</div>
        <div className="text-text-tertiary text-sm mt-2">
          Try adjusting your filters or add new animals
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((animal) => (
        <div key={animal.id} className="card p-4 hover-lift">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-text-primary">
              {animal.name}
            </h3>
            <span className={`badge ${typeBadgeClasses[animal.type]}`}>
              {animal.type}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-text-secondary">
              <span className="font-medium">County:</span>
              <span className="ml-2">{animal.county}</span>
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <span className="font-medium">Owner:</span>
              <span className="ml-2">{animal.owner}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className={`badge ${healthBadgeClasses[animal.health]}`}>
              {animal.health}
            </span>
            <span className="text-xs text-text-tertiary">ID: #{animal.id}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
