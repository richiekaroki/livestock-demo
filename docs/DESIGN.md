# Design System

Biophilic design system for Kenyan livestock management. Earth greens and harvest golds rooted in the domain.

## Colors

**Primary**
- Field Green `#15803D` — buttons, active states, focus rings
- Harvest Gold `#A16207` — secondary CTAs, important metrics

**Neutral**
- Sage White `#FAFDF7` — background
- Forest Ink `#1B2E1B` — text
- Soft Branch `#C8E6C9` — borders

**Status**
- Healthy `#16A34A` · Sick `#DC2626` · Treatment `#D97706` · Recovery `#0284C7`

**Animal Types**
- Cattle `#B45309` · Goat `#7C3AED` · Sheep `#4F46E5` · Camel `#D97706` · Pig `#DB2777` · Chicken `#DC2626`

## Typography

- **Body:** Fira Sans (400, 1rem/1.5)
- **Label:** Fira Sans (500, 0.875rem)
- **Data:** Fira Code (400, 0.875rem) — IDs, timestamps, stats

## Components

- **Buttons:** 8px radius, green fill primary, gold secondary, ghost transparent
- **Cards:** 12px radius, flat at rest, hover shadow on interactive
- **Inputs:** 1px border, green focus ring, red error state
- **Badges:** Pill shape, 10% opacity fill with status color text

## Rules

1. Flat by default — shadows only on hover/focus
2. No uppercase eyebrows above headings
3. No gradient text, no glassmorphism, no bounce animations
4. Every component: default, hover, focus, active, disabled states
5. 4.5:1 contrast ratio minimum

## Mobile

Same tokens as web. 8dp grid. Touch feedback: scale 0.95 on press, haptic on actions. Bottom tab bar with Ionicons.
