# Wam Mfugo — Livestock Management SuperApp

Offline-first livestock tracking platform for Kenya — animal registration, health tracking, biometric identification, and government (KALRO/KIAMIS) reporting. Monorepo: web app, NestJS API, Expo React Native mobile app, and shared domain package.

## Repository Layout

```
wam-mfugo/
├── apps/
│   ├── web/          # Vite + React 19 SPA (deployed to Vercel)
│   ├── api/          # NestJS + Prisma + Postgres (deployed to Render)
│   └── mobile/       # Expo React Native app (4 tabs: Home, Animals, Register, Map)
├── packages/
│   └── shared/       # @wam-mfugo/shared — types, validation, ref data, generator, seed
├── docs/
│   ├── DESIGN.md     # design system (earth-green + harvest-gold palette)
│   ├── IMPLEMENTATION.md  # phased build-out plan
│   ├── AUTH_PLAN.md   # passwordless email OTP authentication plan
│   └── HOW_IT_WORKS.txt  # developer onboarding guide
└── package.json      # npm workspaces + root scripts
```

## Getting Started

**Prerequisites:** Node.js 18+, npm

```bash
git clone https://github.com/richiekaroki/livestock-demo.git
cd livestock-demo
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run dev:web
```

## Root Scripts

| Command | Description |
| --- | --- |
| `npm run dev:web` | Start web dev server (localhost:5173) |
| `npm run dev:api` | Start API server (localhost:4000) |
| `npm run dev:mobile` | Start Expo mobile app |
| `npm run build:web` | Type-check + build web |
| `npm run build:api` | Build NestJS API |
| `npm run build:shared` | Build shared package |
| `npm run lint:web` | Run ESLint on web |
| `npm run lint:api` | Run ESLint on API |
| `npm run test:web` | Run web test suite (151 tests) |
| `npm run test:api` | Run API unit tests (6 tests) |
| `npm run test:api:e2e` | Run API e2e tests |
| `npm run typecheck:mobile` | Type-check mobile app |

## Web App (`apps/web`)

- **Stack:** React 19, TypeScript 5.9 (strict), Vite 7, Tailwind CSS v4, Zustand, React Router v7, React Leaflet, Recharts
- **Tests:** Vitest 4 + @testing-library/react + jsdom (151 passing)
- **Linting:** ESLint 9 (flat config, 0 errors)

### Web structure

```
apps/web/src/
├── components/       # alerts, analytics, animals, dashboard, export, filters,
│                     # layout, map, search, sync, ui
├── contexts/         # (planned) AuthContext
├── data/             # re-exports seedLivestock from shared
├── hooks/            # useLiveData, useOnlineStatus, useAutoRefresh, useTheme, ...
├── pages/            # Home, Dashboard, MapView
├── services/         # mockApi, remoteApi, apiClient, backend selector
├── store/            # Zustand state management
├── styles/css/       # Tailwind v4 global styles + design tokens
├── test/             # Vitest setup and helpers
└── utils/            # debounce, constants, offline storage (Dexie/IndexedDB)
```

### Web environment variables

See `apps/web/.env.example`. Key variables:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API URL (set to hit local/remote API; blank = mock data) |
| `VITE_OFFLINE_MODE` | Force offline-only mode |
| `VITE_ENABLE_BIOMETRIC_CAPTURE` | Toggle biometric prototype features |
| `VITE_AUTO_SYNC` | Enable background sync |

## API (`apps/api`)

- **Stack:** NestJS 11, TypeScript, Prisma 6, class-validator/class-transformer
- **Tests:** Jest + supertest (6 unit + 5 e2e)
- **Linting:** ESLint 9 (0 errors, 7 intentional warnings from supertest)
- **Demo mode:** Runs in-memory when `DATABASE_URL` is unset (zero setup)

### API endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/animals` | List animals (filter by type, health, county) |
| `POST` | `/api/animals` | Register new animal |
| `PATCH` | `/api/animals/:id/health` | Update health status |
| `GET` | `/api/stats` | Aggregate statistics |
| `GET` | `/api/farmers` | List farmers (FM-xxxx codes) |
| `GET` | `/api/ref/counties` | 47 Kenya counties with sub-counties |
| `GET` | `/api/ref/animal-types` | 6 animal types with breeds + common names |
| `GET` | `/api/kalro/veterinary/:animalId` | KALRO vet records (stub) |
| `POST` | `/api/kiamis/register` | KIAMIS registration (stub) |
| `POST` | `/api/outbreaks` | Report disease outbreak |
| `GET` | `/api/health` | Health check |

### API environment variables

See `apps/api/.env.example`. Key variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (blank = in-memory demo mode) |
| `JWT_SECRET` | JWT signing key (auto-generated in .env) |
| `EMAIL_PROVIDER` | `console` (logs OTP to terminal) or `smtp` (real email) |
| `CORS_ORIGIN` | Allowed origins (default: localhost:5173) |

## Shared Package (`packages/shared`)

Single source of truth for domain contracts consumed by web, API, and mobile:

- **Types** — `Livestock`, `Farmer`, `AnimalStats`, `ApiResponse`, `BiometricData`, `HealthStatus`, `AnimalType`, government registration types
- **Validation** — `validateLivestock`, `isValidKenyanNationalId`, `isValidKenyanPhone`
- **Reference Data** — 47 Kenya counties (IEBC codes, sub-counties, centroids), 6 animal types with breeds and common names, Kenyan farmer name pools
- **Generator** — Deterministic PRNG demo data generator (configurable seed, animal count, farmer count)
- **Seed** — `seedLivestock` + `seedFarmers` derived from the generator

## Mobile App (`apps/mobile`)

- **Stack:** Expo SDK 57, React Native 0.86, expo-router (4 tabs)
- **Tabs:** Home, Animals, Register, Map
- **Offline:** AsyncStorage cache + write queue
- **Camera:** expo-camera for biometric capture

## Deployment

- **Web** → Vercel (root dir: `apps/web`, framework: Vite)
- **API** → Render (root dir: `apps/api`)
- **Database** → Neon/Supabase Postgres free tier
- **Mobile** → Expo Go (scan QR, runs on any phone)

## Authentication (Planned)

Passwordless email OTP authentication with three roles (Admin, Field Agent, Farmer). See `docs/AUTH_PLAN.md` for the full plan.

## Design & Product Docs

- `docs/DESIGN.md` — design system ("The Herd Map", earth-green + harvest-gold palette)
- `docs/IMPLEMENTATION.md` — phased build-out plan
- `docs/HOW_IT_WORKS.txt` — developer onboarding guide

## License

&copy; 2026 Richard Karoki. All rights reserved.
