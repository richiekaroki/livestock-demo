# Livestock Tracker Management System (LTMS)

Offline-first livestock tracking dashboard with geospatial analytics, health monitoring, and government API integration points.

## Getting Started

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/richiekaroki/livestock-demo.git
cd livestock-demo/frontend
npm install
cp .env.example .env
npm run dev
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run test suite (watch mode) |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Run tests with Vitest UI |

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── alerts/         # Disease outbreak alerts
│   │   ├── analytics/      # Recharts-powered dashboard charts
│   │   ├── animals/        # Registration, list view, biometric capture
│   │   ├── dashboard/      # Statistics cards, refresh/status indicators
│   │   ├── export/         # CSV/PDF/JSON export (KALRO-compliant)
│   │   ├── filters/        # Type, health, and county filters
│   │   ├── layout/         # Navbar, footer, mobile navigation
│   │   ├── map/            # Leaflet map, heatmaps, marker clustering
│   │   ├── search/         # Debounced search input
│   │   ├── sync/           # Government API sync status
│   │   └── ui/             # Shared components (error boundary, spinner, etc.)
│   ├── data/               # Seed livestock data
│   ├── hooks/              # Custom React hooks (useLiveData, useTheme, etc.)
│   ├── pages/              # Route-level components (Home, Dashboard, MapView)
│   ├── services/           # Mock API, offline storage, health checks
│   ├── store/              # Zustand state management
│   ├── styles/css/         # Global and component styles (Tailwind v4)
│   ├── test/               # Vitest setup and helpers
│   ├── types/              # TypeScript types and type guards
│   └── utils/              # Validation, debounce, constants, environment config
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── eslint.config.js
└── .env.example
```

## Features

- **Livestock CRUD** — Register, search, filter, and export records (CSV, PDF, JSON)
- **Dashboard** — Statistics cards, auto-refreshing data, health status indicators
- **Map view** — Leaflet-based interactive map with marker clustering and disease heatmaps
- **Filters & search** — Filter by animal type, health status, and county; debounced text search
- **Offline-first** — All CRUD operations work without internet; data persisted in localStorage
- **Sync queue** — Background sync with conflict resolution (KALRO/KIAMIS API points)
- **Health alerts** — Disease outbreak notifications
- **Dark/light theme** — Theme toggle with localStorage persistence
- **Mobile responsive** — Separate mobile navigation with responsive layout

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (concurrent rendering) |
| Language | TypeScript 5.9 (strict mode) |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Routing | React Router v7 |
| Maps | React Leaflet + Leaflet marker-cluster |
| Charts | Recharts |
| Testing | Vitest 4 + @testing-library/react + jsdom |
| Linting | ESLint 9 |
| E2E | Playwright |
| Persistence | localStorage (with IndexedDB migration path documented) |

## Environment Variables

See `frontend/.env.example` for the full list. Key variables:

| Variable | Purpose |
|---|---|
| `VITE_KALRO_API_URL` | Government livestock API endpoint |
| `VITE_KIAMIS_API_URL` | Animal identification system endpoint |
| `VITE_AWS_REGION` | AWS region (default: af-south-1) |
| `VITE_OFFLINE_MODE` | Force offline-only mode |
| `VITE_AUTO_SYNC` | Enable background sync |
| `VITE_ENABLE_BIOMETRIC_CAPTURE` | Toggle biometric prototype features |

## License

© 2025 Richard Karoki. All rights reserved.