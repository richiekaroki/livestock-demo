// src/utils/constants.ts
import type { AnimalType, HealthStatus } from "../types";

export const healthBadgeClasses: Record<HealthStatus, string> = {
  Healthy: "badge-healthy",
  Sick: "badge-sick",
  "Under Treatment": "badge-under-treatment",
  Recovered: "badge-recovered",
};

export const typeBadgeClasses: Record<AnimalType, string> = {
  Cattle: "badge-cattle",
  Goat: "badge-goat",
  Sheep: "badge-sheep",
  Camel: "badge-camel",
  Pig: "badge-pig",
  Chicken: "badge-chicken",
};

// For map markers
export const healthColors: Record<HealthStatus, string> = {
  Healthy: "#22c55e",
  Sick: "#ef4444",
  "Under Treatment": "#eab308",
  Recovered: "#3b82f6",
};
