# Wam Mfugo Design System

## Overview

The Wam Mfugo design system is built on an organic biophilic theme using earth greens and harvest gold colors, perfectly suited for an agricultural livestock tracking platform. This system ensures consistency across web and mobile applications while providing flexibility for future growth.

## Color Palette

### Primary Colors
The organic biophilic palette creates a natural, approachable feel appropriate for agricultural contexts.

#### Accent Colors
- **Primary Green**: `#15803D` (Field Green) - Primary actions, CTAs, active states
- **Primary Green Hover**: `#166534` (Forest Green) - Hover states, interactive elements
- **Harvest Gold**: `#A16207` - Secondary accents, important highlights
- **Harvest Gold Hover**: `#854D0E` - Gold hover states

#### Neutral Colors
- **Sage White**: `#FAFDF7` - Primary background
- **Mint Wash**: `#F0FDF4` - Secondary background, cards
- **Pale Leaf**: `#E8F5E9` - Tertiary background, sections
- **Soft Branch**: `#C8E6C9` - Borders, dividers
- **Lichen**: `#6B8A6B` - Tertiary text, muted elements
- **Canopy**: `#3D5A3D` - Secondary text, descriptions
- **Forest Ink**: `#1B2E1B` - Primary text, headings

#### Status Colors
- **Success**: `#15803D` - Healthy states, completed actions
- **Error**: `#DC2626` - Sick states, destructive actions
- **Warning**: `#92400E` - Under treatment, caution states
- **Info**: `#0369A1` - Recovery states, informational messages

#### Animal Type Colors
- **Cattle**: `#B45309`
- **Goat**: `#7C3AED`
- **Sheep**: `#4F46E5`
- **Camel**: `#D97706`
- **Pig**: `#DB2777`
- **Chicken**: `#DC2626`

### Dark Mode Palette
Dark mode preserves the organic theme while improving readability in low-light conditions.

- **Background**: `#0F1117` (Night Forest)
- **Card**: `#1A1D27` (Deep Canopy)
- **Text**: `#E8E9ED` (Light Fern)
- **Accent**: `#4ADE80` (Neon Leaf)
- **Gold**: `#FBBF24` (Bright Gold)

## Typography

### Font Family
- **Primary**: 'Fira Sans', ui-sans-serif, system-ui, sans-serif
- **Monospace**: 'Space Mono', monospace (for numbers, data)

### Type Scale
- **Hero**: 28px / 32px - Page titles, main headings
- **Display**: 32px - Hero sections, marketing copy
- **XXL**: 24px - Section headings
- **XL**: 20px - Subsection headings
- **LG**: 18px - Large body text, important labels
- **Base**: 16px - Default body text
- **MD**: 15px - Secondary body text
- **SM**: 13px - Captions, helper text
- **XS**: 12px - Labels, metadata

### Font Weights
- **Normal**: 400 - Body text
- **Medium**: 500 - Emphasized text
- **Semibold**: 600 - Headings, important labels
- **Bold**: 700 - Strong emphasis, CTAs

### Letter Spacing
- **Tight**: -0.5px - Large headings
- **Normal**: 0px - Body text
- **Wide**: 0.5px - Uppercase labels, buttons

## Spacing System

Based on a 4px base unit for consistent spacing across all components.

### Scale
- **XS**: 4px - Tight spacing, icon padding
- **SM**: 8px - Small gaps, related elements
- **MD**: 12px - Default spacing, component padding
- **LG**: 16px - Section spacing, card padding
- **XL**: 20px - Large gaps, section margins
- **XXL**: 24px - Major sections, page margins
- **XXXL**: 32px - Hero sections, large spacing
- **Section**: 40px - Major content blocks
- **Hero**: 48px - Full-page sections

### Usage Guidelines
- Use 4px multiples for consistency
- Increase spacing between unrelated elements
- Decrease spacing between related elements
- Use larger spacing for mobile touch targets

## Border Radius

### Scale
- **SM**: 8px - Small elements, tags, badges
- **MD**: 12px - Buttons, inputs, small cards
- **LG**: 16px - Cards, containers, modals
- **XL**: 20px - Large cards, sections
- **XXL**: 24px - Hero elements, special containers
- **Pill**: 999px - Full rounded elements (buttons, tags)

### Usage Guidelines
- Use larger radii for containers, smaller for interactive elements
- Consistent radii within component groups
- Pill radius for buttons and tags only

## Shadows

### Shadow System
Green-tinted shadows maintain the organic theme while providing depth.

#### Scale
- **SM**: `0 1px 2px 0 rgb(21 128 61 / 0.05)` - Small elements, buttons
- **MD**: `0 4px 6px -1px rgb(21 128 61 / 0.07), 0 2px 4px -2px rgb(21 128 61 / 0.05)` - Cards, containers
- **LG**: `0 10px 15px -3px rgb(21 128 61 / 0.08), 0 4px 6px -4px rgb(21 128 61 / 0.04)` - Elevated elements, modals
- **XL**: `0 20px 25px -5px rgb(21 128 61 / 0.08), 0 8px 10px -6px rgb(21 128 61 / 0.04)` - Hero elements, overlays

### Usage Guidelines
- Use shadows sparingly to maintain clean aesthetic
- Increase shadow depth for elevated elements
- Avoid shadows on dark backgrounds in dark mode

## Components

### Buttons

#### Variants
- **Primary**: Green background, white text, shadow
- **Secondary**: Light green background, green text, border
- **Ghost**: Transparent background, green text
- **Destructive**: Red background, white text, shadow

#### Sizes
- **SM**: 36px height, small padding, 16px icons
- **MD**: 44px height, medium padding, 20px icons (default)
- **LG**: 52px height, large padding, 22px icons

#### States
- **Default**: Full opacity, normal scale
- **Hover**: Slightly darker background, shadow increase
- **Active**: 0.96 scale, darker background
- **Disabled**: 0.5 opacity, no interaction
- **Loading**: Spinner replaces content, no interaction

### Cards

#### Variants
- **Default**: White background, border, small shadow
- **Elevated**: White background, border, medium shadow
- **Outlined**: Transparent background, thick border
- **Glass**: Semi-transparent background, border, blur effect

#### States
- **Default**: Normal scale, full opacity
- **Pressed**: 0.97 scale, full opacity
- **Disabled**: 0.5 opacity, no interaction

### Inputs

#### States
- **Default**: White background, gray border
- **Focus**: Green border, green shadow
- **Error**: Red border, red text
- **Disabled**: Gray background, gray text

#### Sizes
- **SM**: 36px height, small text
- **MD**: 44px height, normal text (default)
- **LG**: 52px height, large text

### Badges

#### Variants
- **Success**: Green background, green text
- **Warning**: Yellow background, yellow text
- **Error**: Red background, red text
- **Info**: Blue background, blue text

#### Sizes
- **SM**: Small padding, small text
- **MD**: Medium padding, normal text (default)

## Animations

### Timing
- **Fast**: 150ms - Micro-interactions, hover states
- **Normal**: 200ms - Standard transitions, page changes
- **Slow**: 300ms - Complex animations, modals

### Easing
- **Ease Out**: `cubic-bezier(0.25, 1, 0.5, 1)` - Exit animations
- **Ease Out Quint**: `cubic-bezier(0.22, 1, 0.36, 1)` - Smooth deceleration
- **Ease Out Expo**: `cubic-bezier(0.16, 1, 0.3, 1)` - Natural feel, default

### Animation Types
- **Fade In**: Opacity 0 → 1
- **Fade Out**: Opacity 1 → 0
- **Slide Up**: Opacity 0 → 1, translate Y +12px → 0
- **Slide Down**: Opacity 0 → 1, translate Y -12px → 0
- **Scale In**: Opacity 0 → 1, scale 0.95 → 1
- **Scale Out**: Opacity 1 → 0, scale 1 → 0.95

### Usage Guidelines
- Use animations sparingly to maintain performance
- Respect `prefers-reduced-motion` for accessibility
- Provide animation intensity preferences when possible

## Icons

### Icon Sets
- **Web**: Lucide React - Consistent 24px stroke width
- **Mobile**: Ionicons - Consistent sizing and weight

### Sizes
- **XS**: 12px - Tiny icons, inline with text
- **SM**: 16px - Small icons, buttons
- **MD**: 20px - Default icons, navigation
- **LG**: 24px - Large icons, featured elements
- **XL**: 32px - Hero icons, major CTAs

### Usage Guidelines
- Use icons to supplement text, not replace it
- Maintain consistent icon weight within components
- Use appropriate icon for the context (semantic meaning)

## Layout

### Grid System
- **Columns**: 12-column grid for desktop
- **Gaps**: 16px (1rem) default, 32px (2rem) large
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Container Widths
- **Mobile**: 100% with padding
- **Tablet**: 768px max-width
- **Desktop**: 1024px max-width
- **Large Desktop**: 1280px max-width

### Spacing Between Sections
- **Small**: 16px (1rem) - Related content
- **Medium**: 32px (2rem) - Unrelated content
- **Large**: 48px (3rem) - Major sections
- **X-Large**: 64px (4rem) - Page-level separation

## Accessibility

### Color Contrast
- **WCAG AA**: 4.5:1 minimum for normal text
- **WCAG AAA**: 7:1 for large text
- All UI elements meet or exceed WCAG AA standards

### Focus States
- **Default**: 2px green outline, 2px offset
- **High Contrast**: 3px outline, 4px offset
- **Dark Mode**: Light green outline for visibility

### Touch Targets
- **Minimum**: 44px × 44px for all interactive elements
- **Recommended**: 48px × 48px for primary actions
- **Spacing**: 8px minimum between touch targets

### Screen Reader Support
- **ARIA Labels**: All interactive elements have descriptive labels
- **Roles**: Proper semantic roles (button, navigation, etc.)
- **Live Regions**: Dynamic content announcements
- **Heading Structure**: Proper h1-h6 hierarchy

## Responsive Design

### Mobile First Approach
- Design for mobile screens first (320px - 767px)
- Progressively enhance for larger screens
- Touch-optimized interactions on mobile

### Breakpoints
- **XS**: 320px - 374px (Small phones)
- **SM**: 375px - 413px (Phones)
- **MD**: 768px - 1023px (Tablets)
- **LG**: 1024px - 1279px (Desktop)
- **XL**: 1280px+ (Large desktop)

### Mobile Optimizations
- Bottom navigation bar with safe area handling
- Larger touch targets (44px minimum)
- Simplified layouts with progressive disclosure
- Swipe gestures for common actions
- Haptic feedback for confirmation

## Theme Implementation

### Web (Tailwind v4)
```css
@theme {
  --color-bg-primary: #FAFDF7;
  --color-text-primary: #1B2E1B;
  --color-accent: #15803D;
  --color-accent-hover: #166534;
  --color-accent-gold: #A16207;
  /* ... more tokens */
}
```

### Mobile (React Native)
```typescript
const palette = {
  light: {
    text: '#1B2E1B',
    background: '#FAFDF7',
    tint: '#15803D',
    accent: '#A16207',
    // ... more tokens
  },
  dark: {
    text: '#E8E9ED',
    background: '#0F1117',
    tint: '#4ADE80',
    accent: '#FBBF24',
    // ... more tokens
  }
};
```

## Usage Guidelines

### Do's
- Use design tokens consistently across platforms
- Maintain spacing rhythm with 4px base unit
- Provide adequate touch targets for mobile
- Ensure color contrast meets accessibility standards
- Use animations to enhance, not distract
- Test on real devices for mobile interactions

### Don'ts
- Don't mix different spacing systems
- Don't use arbitrary colors outside the palette
- Don't make touch targets smaller than 44px
- Don't rely on color alone to convey meaning
- Don't overuse animations or transitions
- Don't break the design system without documentation

## Component Library

### Web Components
- `Button` - Primary, secondary, ghost, destructive variants
- `Card` - Default, elevated, outlined, glass variants
- `Input` - Text, email, password, select variants
- `Badge` - Status indicators with color variants
- `Modal` - Dialogs, alerts, confirmations
- `Navbar` - Desktop navigation with dropdowns
- `MobileNav` - Bottom tab bar for mobile
- `LoadingSpinner` - Loading states
- `ErrorBoundary` - Error handling UI

### Mobile Components
- `Button` - Pressable with variants and loading states
- `Card` - Touchable cards with variants
- `Badge` - Status badges with variants
- `SearchBar` - Search input with clear button
- `SwipeableRow` - Swipe actions for list items
- `Skeleton` - Loading placeholders
- `EmptyState` - Empty data states
- `AnimalDetailSheet` - Bottom sheet for animal details

## Maintenance

### Version Control
- Document major version changes
- Maintain backward compatibility when possible
- Deprecate old components gradually
- Communicate changes to the team

### Testing
- Test components on multiple devices
- Verify accessibility with screen readers
- Check color contrast ratios
- Test with reduced motion preferences
- Validate responsive behavior

### Updates
- Review and update tokens quarterly
- Gather user feedback on UI patterns
- Monitor accessibility compliance
- Keep documentation current with code changes

## Resources

### Documentation
- Component Storybook stories (when available)
- Figma design files (when available)
- Accessibility audit reports
- User testing results

### Tools
- Color contrast checker
- Screen reader testing (NVDA, VoiceOver)
- Responsive design testing (BrowserStack)
- Performance monitoring (Lighthouse)
- Accessibility testing (axe DevTools)

---

*Last Updated: September 2026*
*Version: 1.0*