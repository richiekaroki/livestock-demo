// src/utils/validation.ts
import type { Livestock } from "../types";

export const validateLivestock = (animal: Partial<Livestock>): string[] => {
  const errors: string[] = [];
  if (!animal.name?.trim()) errors.push("Name is required");
  if (animal.name && animal.name.length < 2)
    errors.push("Name must be at least 2 characters");
  if (!animal.type) errors.push("Type is required");
  if (!animal.health) errors.push("Health status is required");
  if (!animal.county) errors.push("County is required");
  if (!animal.owner?.trim()) errors.push("Owner is required");
  return errors;
};
