import type { AnimalType, HealthStatus } from "@wam-mfugo/shared";

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

// For map markers — uses design token hex values from main.css
export const healthColors: Record<HealthStatus, string> = {
  Healthy: "#15803D",
  Sick: "#DC2626",
  "Under Treatment": "#92400E",
  Recovered: "#0369A1",
};
