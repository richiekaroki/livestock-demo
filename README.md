# Wam Mfugo

Offline-first livestock tracking platform for Kenya. Register animals, monitor health across counties, and sync data to KALRO — online or offline.

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Web** | React 19, Vite 7, TypeScript, Tailwind CSS v4, Zustand, Leaflet |
| **API** | NestJS 11, Prisma 6, Postgres (in-memory fallback) |
| **Mobile** | Expo SDK 57, React Native 0.86, expo-router |
| **Shared** | `@wam-mfugo/shared` — types, validation, Kenya reference data |
| **Tests** | Vitest (web, 151), Jest (API, 6+5 e2e) |

## Quick Start

```bash
git clone https://github.com/richiekaroki/livestock-demo.git
cd livestock-demo
npm install
npm run dev:web     # http://localhost:5173
npm run dev:api     # http://localhost:4000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start web dev server |
| `npm run dev:api` | Start API server |
| `npm run dev:mobile` | Start Expo mobile app |
| `npm run build:web` | Build web for production |
| `npm run build:api` | Build NestJS API |
| `npm run test:web` | Run web tests (151) |
| `npm run test:api` | Run API tests (6) |
| `npm run typecheck:mobile` | Type-check mobile |

## Project Structure

```
apps/
├── web/         # Vite + React 19 SPA
├── api/         # NestJS REST API
└── mobile/      # Expo React Native (4 tabs)
packages/
└── shared/      # Domain types, Kenya ref data, demo generator
docs/
├── DESIGN.md        # Design system
├── IMPLEMENTATION.md # Build plan
└── AUTH_PLAN.md     # Auth plan (email OTP)
```

## Features

- **Animal registration** with biometric capture (camera + SHA-256 hash)
- **Health tracking** — Healthy, Sick, Under Treatment, Recovered
- **6 animal types** — Cattle, Goat, Sheep, Camel, Pig, Chicken (with breeds)
- **47 Kenya counties** with sub-counties and GPS centroids
- **Farmer management** with FM-xxxx codes and Kenyan names
- **Offline-first** — IndexedDB (web) + AsyncStorage (mobile) with write queue
- **Map view** — Leaflet markers clustered by county
- **KALRO/KIAMIS integration** — stubbed, ready for real credentials

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/animals` | List animals (filter by type, health, county) |
| `POST` | `/api/animals` | Register animal |
| `PATCH` | `/api/animals/:id/health` | Update health status |
| `GET` | `/api/stats` | Aggregate statistics |
| `GET` | `/api/farmers` | List farmers |
| `GET` | `/api/ref/counties` | 47 Kenya counties |
| `GET` | `/api/ref/animal-types` | 6 animal types with breeds |
| `GET` | `/api/health` | Health check |

## Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Web | Vercel | Root: `apps/web`, Framework: Vite |
| API | Render | Root: `apps/api`, free tier (spins down after 15 min) |
| Database | Neon/Supabase | Free Postgres tier |
| Mobile | Expo Go | Scan QR on any phone |

## Environment Variables

**API** (`apps/api/.env` — gitignored):
- `DATABASE_URL` — Postgres connection (blank = in-memory demo)
- `JWT_SECRET` — JWT signing key
- `EMAIL_PROVIDER` — `console` or `smtp`

**Web** (`apps/web/.env` — gitignored):
- `VITE_API_BASE_URL` — API URL (blank = mock data)

**Mobile** (`apps/mobile/.env` — gitignored):
- `EXPO_PUBLIC_API_URL` — API URL

## License

&copy; 2026 Richard Karoki. All rights reserved.
