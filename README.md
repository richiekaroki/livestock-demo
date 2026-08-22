# Wam Mfugo

Offline-first livestock tracking platform for Kenya — register animals, monitor health across 47 counties, and sync to KALRO/KIAMIS online or offline. Passwordless email-OTP auth. Swahili/English i18n.

## Stack

| Layer | Tech |
|-------|------|
| **Web** | React 19, Vite 7, TypeScript, Tailwind v4, Zustand, Leaflet, react-i18next |
| **API** | NestJS 11, Prisma 6, PostgreSQL (in-memory fallback), Socket.io |
| **Mobile** | Expo SDK 57, React Native 0.86, expo-router |
| **Shared** | `@wam-mfugo/shared` — types, validators, Kenya reference data |
| **Auth** | Email OTP + JWT (HttpOnly cookie refresh), rate limiting, roles, audit trail |
| **Tests** | Vitest (151) · Jest (21 + e2e) · Playwright (15) |
| **Deploy** | Vercel (web) · Render (api) · Neon/Supabase (Postgres) |

## Quick Start

```bash
npm install
npm run dev:api     # http://localhost:4000 — start first
npm run dev:web     # http://localhost:5173
```

Set `DEFAULT_ADMIN_EMAIL` in `apps/api/.env`. Login with that email; the OTP prints in the API console (demo mode) or arrives via email (`EMAIL_PROVIDER=smtp`).

Full stack with Postgres: `docker compose up --build`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` / `dev:api` / `dev:mobile` | Start each app |
| `npm run build:web` / `build:api` | Production builds |
| `npm run test:web` / `test:api` / `test:api:e2e` | Tests |
| `npm run typecheck:mobile` | Type-check mobile |
| `npm run lint:web` | Lint web |

## Structure

```
apps/web          React SPA (auth, admin, maps, charts, offline-first)
apps/api          NestJS API (auth, animals, farmers, stats, KALRO, KIAMIS)
apps/mobile       Expo app (register, camera, map, profile)
packages/shared   Types, Kenya ref data (47 counties, 6 animal types), demo generator
docs/             Security assessment, auth plan, design, implementation
```

## Features

- **Auth** — Passwordless email OTP, JWT (access + HttpOnly refresh cookie), 3 roles, rate limiting, account lockout, audit trail
- **Animals** — Registration with biometric capture, health tracking, 6 types with breeds, breed-specific naming
- **Offline-first** — IndexedDB/AsyncStorage cache, write queue with conflict resolution, reconnection replay
- **Reference data** — 47 Kenya counties (IEBC codes, GPS), 6 animal types with breeds, deterministic demo generator
- **KALRO/KIAMIS** — Integration stubs ready for real credentials
- **i18n** — Swahili/English, 200+ translated keys, language switcher
- **Vaccinations** — CRUD API, daily cron scheduler, 3-day advance email reminders
- **Real-time** — Socket.io WebSockets for live stats and animal events
- **Security** — CORS whitelist, CSP, helmet headers, rate limiting, JWT secret enforcement, npm audit overrides

## API

Interactive Swagger docs at `/api/docs` when the API is running.

Key endpoints: `/api/animals` (CRUD + export), `/api/stats`, `/api/farmers`, `/api/ref/*`, `/api/vaccinations`, `/api/auth/*`, `/api/admin/*`

Protected endpoints require `Authorization: Bearer <token>`; the client auto-refreshes on 401.

## Environment Variables

| App | Variable | Required | Default |
|-----|----------|----------|---------|
| API | `JWT_SECRET` | Yes | — |
| API | `DATABASE_URL` | No | in-memory |
| API | `EMAIL_PROVIDER` | No | `console` |
| API | `DEFAULT_ADMIN_EMAIL` | No | `admin@example.com` |
| API | `CORS_ORIGIN` | Yes | — |
| Web | `VITE_API_BASE_URL` | No | mock mode |
| Mobile | `EXPO_PUBLIC_API_URL` | No | `http://localhost:4000/api` |

## Security

JWT_SECRET enforced on startup, CORS origin whitelist (no wildcards), global rate limiting (3 tiers), HttpOnly refresh cookie, email enumeration prevention, OTP invalidation, CSP + HSTS + helmet headers, Docker secrets via env_file. See `docs/SECURITY_ASSESSMENT.md`.

## License

&copy; 2026 Richard Karoki. All rights reserved.
