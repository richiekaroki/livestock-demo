// src/types/constants.ts
import type { AnimalType, HealthStatus } from "../types";

export const healthColors: Record<HealthStatus, string> = {
  Healthy: "#3BA55C",
  Sick: "#EF4444",
  "Under Treatment": "#D4A017",
  Recovered: "#60A5FA",
};

export const healthBadgeClasses: Record<HealthStatus, string> = {
  Healthy: "bg-green-100 text-green-800 border-green-200",
  Sick: "bg-red-100 text-red-800 border-red-200",
  "Under Treatment": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Recovered: "bg-blue-100 text-blue-800 border-blue-200",
};

export const typeBadgeClasses: Record<AnimalType, string> = {
  Cattle: "bg-orange-100 text-orange-800 border-orange-200",
  Goat: "bg-purple-100 text-purple-800 border-purple-200",
  Sheep: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Camel: "bg-amber-100 text-amber-800 border-amber-200",
  Pig: "bg-pink-100 text-pink-800 border-pink-200",
  Chicken: "bg-red-100 text-red-800 border-red-200",
};
