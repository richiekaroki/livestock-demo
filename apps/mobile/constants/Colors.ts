// Organic Biophilic palette — earth greens + harvest gold
// Matches web app design tokens exactly
const palette = {
  // Greens
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green300: '#86EFAC',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D', // Primary accent
  green800: '#166534', // Primary hover
  green900: '#14532D',

  // Gold / Amber
  gold50: '#FFFBEB',
  gold100: '#FEF3C7',
  gold200: '#FDE68A',
  gold400: '#FBBF24',
  gold500: '#F59E0B',
  gold600: '#D97706',
  gold700: '#A16207', // Harvest Gold

  // Neutrals — Organic earth tones
  neutral50: '#FAFDF7',  // Sage White (bg primary)
  neutral100: '#F0FDF4', // Mint Wash (bg secondary)
  neutral200: '#E8F5E9', // Pale Leaf (bg tertiary)
  neutral300: '#C8E6C9', // Soft Branch (border)
  neutral400: '#6B8A6B', // Lichen (text tertiary)
  neutral500: '#3D5A3D', // Canopy (text secondary)
  neutral600: '#1B2E1B', // Forest Ink (text primary)
  neutral700: '#132413', // Dark bg secondary
  neutral800: '#0C1A0C', // Dark bg primary
  neutral900: '#0C1A0C',

  // Status colors — Exact web match
  red500: '#EF4444',
  red600: '#DC2626', // Alert Red
  red50: '#FEF2F2',
  blue500: '#0284C7', // Recovery Blue
  blue50: '#F0F9FF',
};

export default {
  light: {
    text: palette.neutral600,          // Forest Ink #1B2E1B
    textSecondary: palette.neutral500, // Canopy #3D5A3D
    textTertiary: palette.neutral400,  // Lichen #6B8A6B
    background: palette.neutral50,     // Sage White #FAFDF7
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    tint: palette.green700,            // Field Green #15803D
    tintLight: palette.green100,
    accent: palette.gold700,           // Harvest Gold #A16207
    accentLight: palette.gold100,
    border: palette.neutral300,        // Soft Branch #C8E6C9
    borderLight: palette.neutral300,
    tabIconDefault: palette.neutral400,
    tabIconSelected: palette.green700,
    destructive: palette.red600,       // Alert Red #DC2626
    destructiveLight: palette.red50,
    success: palette.green600,         // Healthy Green #16A34A
    warning: palette.gold600,          // Treatment Amber #D97706
    info: palette.blue500,             // Recovery Blue #0284C7
    card: '#FFFFFF',
    cardBorder: palette.neutral300,    // Soft Branch #C8E6C9
    inputBg: '#FFFFFF',
    inputBorder: palette.neutral300,
    placeholder: palette.neutral400,
    // Shadows — green-tinted like web
    shadowColor: palette.green700,
    shadowOpacity: 0.08,
    // Animal type colors
    typeCattle: '#B45309',
    typeGoat: '#7C3AED',
    typeSheep: '#4F46E5',
    typeCamel: '#D97706',
    typePig: '#DB2777',
    typeChicken: '#DC2626',
  },
  dark: {
    text: '#E8F5E9',                   // Light Fern
    textSecondary: '#A5D6A7',          // Soft Moss
    textTertiary: '#66BB6A',           // Bright Leaf
    background: '#0C1A0C',            // Night Forest
    surface: '#132413',               // Deep Canopy
    surfaceElevated: '#1A2E1A',       // Understory
    tint: '#4ADE80',                   // Neon Leaf
    tintLight: '#1A2E1A',
    accent: '#FBBF24',                 // Bright Gold
    accentLight: '#854D0E',
    border: '#2E4A2E',                 // Dark Branch
    borderLight: '#2E4A2E',
    tabIconDefault: '#66BB6A',
    tabIconSelected: '#4ADE80',
    destructive: '#EF4444',
    destructiveLight: '#450A0A',
    success: '#4ADE80',
    warning: '#FBBF24',
    info: '#38BDF8',
    card: '#132413',
    cardBorder: '#2E4A2E',
    inputBg: '#1A2E1A',
    inputBorder: '#2E4A2E',
    placeholder: '#66BB6A',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    typeCattle: '#B45309',
    typeGoat: '#7C3AED',
    typeSheep: '#4F46E5',
    typeCamel: '#D97706',
    typePig: '#DB2777',
    typeChicken: '#DC2626',
  },
};

export { palette };
