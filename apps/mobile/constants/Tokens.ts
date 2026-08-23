// Design tokens — 8dp rhythm, organic shadows, consistent radii
import { Platform } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
  hero: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  hero: 28,
  display: 32,
} as const;

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

function shadow(depth: 1 | 2 | 3, color: string, opacity: number) {
  const base = Platform.OS === 'ios' ? {
    shadowColor: color,
    shadowOffset: { width: 0, height: depth * 2 },
    shadowOpacity: opacity,
    shadowRadius: depth * 4,
  } : {
    elevation: depth * 2,
  };
  return base;
}

export const shadows = {
  sm: (color: string, opacity = 0.08) => shadow(1, color, opacity),
  md: (color: string, opacity = 0.12) => shadow(2, color, opacity),
  lg: (color: string, opacity = 0.16) => shadow(3, color, opacity),
} as const;
