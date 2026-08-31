// Shared constants for animal types and status colors
// Used across health-assessment, kalro-report, simulator, diseases screens

export const ANIMAL_TYPES = ['Cattle', 'Goat', 'Sheep', 'Camel', 'Pig', 'Chicken'] as const;

export const STATUS_COLORS: Record<string, string> = {
  healthy: '#22C55E',
  sick: '#DC2626',
  under_treatment: '#F59E0B',
  needs_attention: '#F97316',
};

export const RISK_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#F59E0B',
  low: '#22C55E',
};
