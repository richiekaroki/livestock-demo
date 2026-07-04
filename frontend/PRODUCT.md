# Product

## Register

product

## Users

The app serves three distinct user groups across Kenya's livestock ecosystem:

1. **Kenyan Livestock Farmers** — Register and track their animals, report health issues, view their herd status. Context: field use on mobile devices with unreliable connectivity, often in rural areas.
2. **Agricultural Extension Officers** — Monitor animal health across counties, coordinate disease responses, oversee farmer registrations. Context: office and field use, reviewing dashboards and maps.
3. **Government Agencies (KALRO/KIAMIS)** — Receive synced livestock data, manage the national registry, track biometric identification. Context: systemic oversight, data ingestion from field operations.

The interface must work for all three without dumbing down for any.

## Product Purpose

A livestock management system that enables registration, health tracking, biometric identification, and government reporting for Kenya's livestock sector. It bridges field-level data collection (farmers, officers) with national-level data infrastructure (KALRO, KIAMIS). Success: accurate, timely livestock data that reaches government registries without requiring constant connectivity.

## Brand Personality

Professional, modern, efficient. The tool should feel like a well-built instrument — reliable, precise, no wasted motion. Not flashy, not timid. Confident in its domain.

## Anti-references

- **Generic SaaS dashboard** — Overpolished, cookie-cutter admin panels with gradient cards, hero-metric templates, identical card grids, and decorative motion. The kind of interface where every section has a tiny uppercase eyebrow and a big number with a small label.
- **Dated government portal** — Cluttered, hard to navigate, visually stale interfaces that erode trust.

## Design Principles

1. **Earned familiarity** — Standard patterns, consistent vocabulary, no invented affordances. Users should feel productive immediately, not need a tutorial.
2. **Offline-first, field-ready** — Every design decision must work under poor connectivity and on mobile devices in bright outdoor light.
3. **Data density without noise** — Tables, charts, maps, and filters serve a task. Decorate nothing. Every element earns its space.
4. **Government-grade trustworthiness** — Not corporate polish, not government drab. Professional enough that agencies trust the data, approachable enough that farmers use it.
5. **Show the domain, not the framework** — Cattle, goats, sheep, camels, counties, health statuses. The interface should feel like it was built for livestock, not for a generic dashboard template.

## Accessibility & Inclusion

- WCAG AA compliance
- Screen reader support with semantic HTML and ARIA labels
- Keyboard navigation across all interactive elements
- `prefers-reduced-motion` support for all animations
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text
- Focus-visible indicators on all interactive elements
- Status colors supplemented with text labels (not color alone)
