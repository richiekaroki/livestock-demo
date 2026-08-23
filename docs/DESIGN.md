---
name: Wam Mfugo
description: Kenya livestock management system — registration, health tracking, biometric identification, and government reporting.
colors:
  primary: "#15803D"
  primary-hover: "#166534"
  primary-gold: "#A16207"
  primary-gold-hover: "#854D0E"
  bg-primary: "#FAFDF7"
  bg-secondary: "#F0FDF4"
  bg-tertiary: "#E8F5E9"
  text-primary: "#1B2E1B"
  text-secondary: "#3D5A3D"
  text-tertiary: "#6B8A6B"
  border: "#C8E6C9"
  success: "#16A34A"
  error: "#DC2626"
  warning: "#D97706"
  info: "#0284C7"
  type-cattle: "#B45309"
  type-goat: "#7C3AED"
  type-sheep: "#4F46E5"
  type-camel: "#D97706"
  type-pig: "#DB2777"
  type-chicken: "#DC2626"
  dark-bg-primary: "#0C1A0C"
  dark-bg-secondary: "#132413"
  dark-bg-tertiary: "#1A2E1A"
  dark-text-primary: "#E8F5E9"
  dark-text-secondary: "#A5D6A7"
  dark-text-tertiary: "#66BB6A"
  dark-border: "#2E4A2E"
  dark-accent: "#4ADE80"
  dark-accent-hover: "#22C55E"
  dark-gold: "#FBBF24"
  dark-gold-hover: "#F59E0B"
typography:
  body:
    fontFamily: "Fira Sans, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "Fira Code, ui-monospace, monospace"
    fontWeight: 400
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#ffffff"
  button-gold:
    backgroundColor: "{colors.primary-gold}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  input:
    backgroundColor: "{colors.bg-primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  card:
    backgroundColor: "{colors.bg-primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded-lg}"
    padding: "1.5rem"
---

# Design System: Wam Mfugo

## 1. Overview

**Creative North Star: "The Herd Map"**

This is a data-dense operational tool for Kenya's livestock sector. The interface renders the territory of Kenya's livestock visible — counties, health statuses, animal types, biometric records — so farmers, officers, and agencies can act on what they see. The design rejects the generic SaaS dashboard aesthetic: no gradient hero-metrics, no identical icon-heading-text card grids, no decorative motion, no tiny uppercase eyebrows above every section.

The system earns familiarity through standard patterns and consistent vocabulary. It does not invent affordances for standard tasks. The tool should disappear into the task — a farmer registering a camel in Garissa should not notice the interface, only the data. Tactile, confident components signal capability without shouting. The palette is rooted in the land itself: earth greens and harvest golds that belong to the domain, not to a design trend.

**Key Characteristics:**

- Data-forward layout with structural density
- Tactile, confident interactive components
- Domain-rooted palette (earth green + harvest gold)
- Flat elevation with shadows reserved for state changes
- Consistent vocabulary across every screen

## 2. Colors

The palette is rooted in Kenya's landscape — earth greens for the land, harvest gold for its bounty. Status colors carry semantic weight: green is healthy, red is sick, amber is treatment, blue is recovery. Animal type colors are high-contrast and distinct for quick scanning on maps and dashboards.

### Primary

- **Field Green** (#15803D): Primary accent — buttons, active states, focus rings, current navigation. Used sparingly to guide the eye, never decoration.
- **Deep Moss** (#166534): Hover state for primary green. Darker, more grounded.
- **Harvest Gold** (#A16207): Secondary accent — CTA highlights, important metrics, sync status. Warm and authoritative.
- **Burnt Ochre** (#854D0E): Hover state for gold. Earthy depth.

### Neutral

- **Sage White** (#FAFDF7): Primary background. Near-white with a green tint — not cream, not sand, not the AI warm-neutral band. Clearly green-rooted.
- **Mint Wash** (#F0FDF4): Secondary background — sidebar panels, alternating sections.
- **Pale Leaf** (#E8F5E9): Tertiary background — disabled states, subtle fills.
- **Forest Ink** (#1B2E1B): Primary text. Deep forest green, not black.
- **Canopy** (#3D5A3D): Secondary text — descriptions, supporting content.
- **Lichen** (#6B8A6B): Tertiary text — placeholders, captions, timestamps.
- **Soft Branch** (#C8E6C9): Borders and dividers. Green-tinted, not gray.

### Status

- **Healthy Green** (#16A34A): Healthy animals, success states, positive indicators.
- **Alert Red** (#DC2626): Sick animals, critical alerts, errors.
- **Treatment Amber** (#D97706): Under-treatment animals, warnings, attention needed.
- **Recovery Blue** (#0284C7): Recovered animals, informational badges.

### Animal Types

- **Cattle Brown** (#B45309): Cattle markers and badges.
- **Goat Violet** (#7C3AED): Goat markers and badges.
- **Sheep Indigo** (#4F46E5): Sheep markers and badges.
- **Camel Ochre** (#D97706): Camel markers and badges.
- **Pig Rose** (#DB2777): Pig markers and badges.
- **Chicken Crimson** (#DC2626): Chicken markers and badges.

### Dark Theme Overrides

- **Night Forest** (#0C1A0C): Primary background — deep green-black, not pure black.
- **Deep Canopy** (#132413): Secondary background.
- **Understory** (#1A2E1A): Tertiary background.
- **Light Fern** (#E8F5E9): Primary text on dark.
- **Soft Moss** (#A5D6A7): Secondary text on dark.
- **Bright Leaf** (#66BB6A): Tertiary text on dark.
- **Dark Branch** (#2E4A2E): Borders on dark.
- **Neon Leaf** (#4ADE80): Accent on dark — brighter green for contrast.
- **Bright Gold** (#FBBF24): Gold accent on dark.

### Named Rules

**The Earth Rule.** Every color in this system traces to a real thing in Kenya's landscape. Green is the land. Gold is the harvest. Brown is cattle. Violet is goat. If a color doesn't map to the domain, it doesn't belong.

## 3. Typography

**Body Font:** Fira Sans (with ui-sans-serif, system-ui, sans-serif fallback)
**Mono Font:** Fira Code (with ui-monospace, monospace fallback)

**Character:** One family carries the entire interface. Fira Sans is humanist without being soft — its open terminals and generous x-height read well at small sizes on mobile screens in bright sunlight. Fira Code handles data values, IDs, and registration numbers with tabular figures.

### Hierarchy

- **Body** (400 weight, 1rem/1.5): Default for all text. Maximum line length 65–75ch for prose; data-dense areas run shorter.
- **Label** (500 weight, 0.875rem/1.4): Form labels, filter labels, card metadata. No uppercase — mixed case only.
- **Data** (400 weight, Fira Code, 0.875rem): Animal IDs, registration numbers, timestamps, stat values. Monospace for alignment.

### Named Rules

**The No-Eyebrow Rule.** No tiny uppercase tracked text above section headings. Headings speak for themselves. If a heading needs context, add a short description below it — not a kicker above it.

## 4. Elevation

Flat by default. Shadows appear only as a response to state — hover, focus, active, open dropdown. The system uses green-tinted shadows (`rgb(21 128 61 / ...)`) that reinforce the earth palette rather than generic black shadows that feel disconnected from the brand.

### Shadow Vocabulary

- **Resting** (no shadow): Default state for cards, inputs, containers. The data speaks, not the container.
- **Hover** (`0 4px 6px -1px rgb(21 128 61 / 0.07)`): Subtle lift on interactive cards and buttons. Signals "this is clickable."
- **Focus** (2px solid accent outline): Keyboard focus indicator. No shadow — the outline is the signal.
- **Open dropdown** (`0 10px 15px -3px rgb(21 128 61 / 0.08)`): Menu panels float above content when open.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, focus, active, open). A card with a permanent shadow is a card that's always shouting.

## 5. Components

### Buttons

- **Shape:** Gently curved edges (8px radius), rectangular with no border unless ghost variant.
- **Primary:** Field Green fill, white text. Padding 10px 20px. Used for primary actions (Register, Save, Sync).
- **Gold:** Harvest Gold fill, white text. Used for secondary CTAs and important but non-primary actions.
- **Ghost:** Transparent fill, text matches foreground. Used for cancel, close, low-emphasis actions.
- **Hover / Focus:** Hover darkens fill by one step. Focus shows 2px outline in accent color with 2px offset. Active state presses down 1px.
- **Disabled:** 50% opacity, cursor not-allowed. No hover shadow.

### Cards / Containers

- **Corner Style:** 12px radius (rounded-lg). Not over-rounded — cards are structural, not decorative.
- **Background:** Sage White (light) or Night Forest (dark).
- **Shadow Strategy:** Flat by default. Hover shadow on interactive cards only.
- **Border:** 1px Soft Branch (light) or Dark Branch (dark). Subtle, structural.
- **Internal Padding:** 1.5rem (24px).

### Inputs / Fields

- **Style:** 1px border in Soft Branch, Sage White background, 8px radius. Padding 10px 14px.
- **Focus:** Border shifts to Field Green, 2px outline appears. No glow, no shadow.
- **Error:** Border shifts to Alert Red, error message appears below in red text.
- **Disabled:** Pale Leaf background, Lichen text.

### Navigation

- **Desktop Navbar:** Frosted glass backdrop (blur 12px), Sage White fill at 80% opacity. Logo left, nav links center, theme toggle right. Active link gets Field Green text with 2px bottom border.
- **Mobile Nav:** Bottom sheet or hamburger menu. Each link gets an SVG icon above the label. Active state: green fill, white icon.
- **Typography:** 500 weight, 0.9375rem. No uppercase.

### Badges / Chips

- **Health Badges:** Solid fill with 10% opacity of the status color, text in the full status color. Rounded-full (pill shape). Compact padding 2px 10px.
- **Type Badges:** Same treatment as health badges, using animal type colors.
- **No side-stripe borders.** Badges are self-contained pills, not cards with colored left borders.

### Alerts / Callouts

- **Shape:** Full-width container with status-colored background at 10% opacity. 1px border in status color at 20% opacity.
- **No side-stripe borders.** The background tint and border provide the signal. A colored left border is decoration, not information.
- **Icon:** SVG icon in the status color, positioned left.
- **Content:** Title in bold, description in regular weight below.

## 6. Do's and Don'ts

### Do

- **Do** use Field Green (#15803D) for primary actions, active states, and focus indicators only. Its rarity is the point.
- **Do** use Harvest Gold (#A16207) to highlight important metrics and secondary CTAs. It carries warmth without competing with green.
- **Do** keep cards flat at rest. Shadows appear only on hover for interactive elements.
- **Do** use health and animal type badges as self-contained pills with tinted backgrounds. The status color is the fill, not a side stripe.
- **Do** test every text color against its background for ≥4.5:1 contrast. If it's even close, darken the text.
- **Do** use Fira Code for data values, IDs, and registration numbers. Monospace for alignment.
- **Do** show reduced-motion alternatives for every animation. Crossfade or instant, never gated on a class that might not fire.

### Don't

- **Don't** use generic SaaS dashboard patterns: gradient hero-metrics, identical icon-heading-text card grids, tiny uppercase tracked eyebrows above every section, numbered section markers (01 / 02 / 03).
- **Don't** pair `border: 1px solid X` with `box-shadow: 0 Npx Mpx ...` where M ≥ 16px on the same element. Pick one — the ghost-card pattern is banned.
- **Don't** use `border-radius: 24px+` on cards. Cards top out at 12–16px. Full-pill is fine for badges and tags.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent on cards, list items, callouts, or alerts. Rewrite with full borders, background tints, or nothing.
- **Don't** use gradient text (`background-clip: text` with a gradient). Use a single solid color. Emphasis via weight or size.
- **Don't** use glassmorphism decoratively. Blurs and glass cards are rare and purposeful, or nothing.
- **Don't** animate CSS layout properties unless truly needed. Ease out with exponential curves. No bounce, no elastic.
- **Don't** use display fonts in UI labels, buttons, or data. Fira Sans carries the entire interface.
- **Don't** ship components with fewer than five states: default, hover, focus, active, disabled. Error and loading when applicable.
- **Don't** use spinners in the middle of content. Use skeleton states for loading.

---

## 7. Mobile App — Native Feel Guidelines

Cross-platform consistency: the mobile app (`apps/mobile`) matches the web app (`apps/web`) token-for-token. The mobile app uses the same Organic Biophilic palette, the same 8dp spacing rhythm, and the same component vocabulary — translated to React Native primitives.

### Safe Areas

All screens respect top/bottom safe areas via `useSafeAreaInsets()`. Fixed elements (headers, tab bars, CTA buttons) never collide with the notch, status bar, or home indicator. Content scrolls behind fixed chrome with proper insets.

### Touch Feedback

Every interactive element provides immediate tactile response:

- **Pressable scale**: Cards and buttons scale down 0.95–0.98 on press (200ms spring). No visual lag.
- **Opacity dim**: Pressed state reduces opacity to 0.85–0.92. Subtle but clear.
- **Haptic feedback**: Light impact on chip/filter selection. Medium impact on primary actions (register, save). Success notification on form submission. Error notification on failures.
- **Android ripple**: Use `android_ripple` for native Material ripple on Android devices.

### Pull-to-Refresh

All list screens support pull-to-refresh with a themed `RefreshControl`. Tint color matches `colors.tint` (Field Green). Pull-to-refresh is available on Home (animals list) and Animals (filtered list).

### Keyboard Avoiding

Form screens (Register, Profile, Login) use `KeyboardAvoidingView` with `behavior="padding"` on iOS and `behavior="height"` on Android. Forms are wrapped in `ScrollView` with `contentContainerStyle` that respects keyboard overlap.

### Tab Bar

Bottom tab bar uses Ionicons with consistent sizing (25px). Active tint uses Field Green (#15803D) or Neon Leaf (#4ADE80) in dark mode. Inactive tint uses Lichen (#6B8A6B) in light mode, Bright Leaf (#66BB6A) in dark mode. Tab bar background matches surface color with a top border in Soft Branch (#C8E6C9).

### Animations

- **Duration**: Micro-interactions 150–300ms. Never longer than 500ms for UI feedback.
- **Easing**: Ease-out-expo (`cubic-bezier(0.16, 1, 0.3, 1)`) for entrances. Ease-in for exits.
- **Reduced motion**: Respect `prefers-reduced-motion`. Use opacity-only crossfade, no scale/translate.

### Badge System

Health badges use 10% opacity fill of the status color with full-opacity text:
- Healthy: #16A34A on #DCFCE7
- Sick: #DC2626 on #FEF2F2
- Under Treatment: #D97706 on #FEF3C7
- Recovered: #0284C7 on #F0F9FF

Animal type badges follow the same pattern with type-specific colors.

### Token Mapping (Web → Mobile)

| Web CSS Variable | Mobile Token | Value |
|------------------|--------------|-------|
| `--color-accent` | `colors.tint` | #15803D (light) / #4ADE80 (dark) |
| `--color-accent-gold` | `colors.accent` | #A16207 (light) / #FBBF24 (dark) |
| `--color-bg-primary` | `colors.background` | #FAFDF7 (light) / #0C1A0C (dark) |
| `--color-bg-secondary` | `colors.surface` | #F0FDF4 (light) / #132413 (dark) |
| `--color-text-primary` | `colors.text` | #1B2E1B (light) / #E8F5E9 (dark) |
| `--color-text-secondary` | `colors.textSecondary` | #3D5A3D (light) / #A5D6A7 (dark) |
| `--color-border` | `colors.border` | #C8E6C9 (light) / #2E4A2E (dark) |
| `--color-success` | `colors.success` | #16A34A |
| `--color-error` | `colors.destructive` | #DC2626 |
| `--color-warning` | `colors.warning` | #D97706 |
| `--color-info` | `colors.info` | #0284C7 |
| `--radius-md` | `radius.md` | 12px |
| `--radius-lg` | `radius.lg` | 16px |
| `--shadow-sm` | `shadows.sm()` | elevation 2 / shadow 2px |

### Spacing Rhythm

The mobile app uses an 8dp base grid matching the web's rem-based system:
- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 12px (0.75rem)
- lg: 16px (1rem)
- xl: 20px (1.25rem)
- xxl: 24px (1.5rem)
- xxxl: 32px (2rem)
