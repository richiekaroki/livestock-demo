import type { Livestock } from "./types";

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

const NATIONAL_ID_PATTERN = /^\d{7,8}$/;
const PHONE_PATTERN = /^\+254[17]\d{8}$/;

export const isValidKenyanNationalId = (id: string): boolean => {
  return NATIONAL_ID_PATTERN.test(id);
};

export const isValidKenyanPhone = (phone: string): boolean => {
  return PHONE_PATTERN.test(phone);
};

export const ANIMAL_NAME_MIN_LENGTH = 2;
export const ANIMAL_NAME_MAX_LENGTH = 50;