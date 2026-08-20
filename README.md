# Wam Mfugo

Offline-first livestock tracking platform for Kenya — register animals, monitor health across counties, and sync to KALRO online or offline. Passwordless email-OTP auth with Admin / Field Agent / Farmer roles.

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Web** | React 19, Vite 7, TypeScript, Tailwind v4, Zustand, Leaflet |
| **API** | NestJS 11, Prisma 6, Postgres (in-memory fallback) |
| **Mobile** | Expo SDK 57, React Native 0.86, expo-router |
| **Shared** | `@wam-mfugo/shared` — types, validation, Kenya reference data |
| **Auth** | Email OTP + JWT (access/refresh), roles, sessions, audit, Brevo SMTP |
| **Tests** | Vitest (web, 151), Jest (API, 21 + e2e) |

## Quick Start

```bash
npm install
npm run dev:api     # http://localhost:4000 — start first
npm run dev:web     # http://localhost:5173
```

Login with the seeded admin `rkabue23@gmail.com`; the OTP prints in the API console (demo) or arrives via email (`EMAIL_PROVIDER=smtp`).

Prefer the full stack (Postgres + API + web) in one command? `docker compose up --build` → http://localhost:5173, API at http://localhost:4000/api.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` / `dev:api` / `dev:mobile` | Start each app |
| `npm run build:web` / `build:api` / `build:shared` | Production builds |
| `npm run test:web` (151) / `test:api` (21) / `test:api:e2e` | Tests |
| `npm run typecheck:mobile` | Type-check mobile |

## Project Structure

```
apps/web, apps/api, apps/mobile   # React SPA, NestJS API, Expo app
packages/shared                   # Types, Kenya ref data, demo generator
docs/                             # DESIGN.md, IMPLEMENTATION.md, AUTH_PLAN.md, HOW_IT_WORKS.txt
```

## Features

- Passwordless email-OTP auth with roles (admin gated `/admin/*` pages), rate limiting + lockout
- Animal registration with biometric capture, health tracking, 6 animal types, 47 counties
- Farmer management (FM-xxxx codes), map view, offline-first (IndexedDB/AsyncStorage write queue)
- KALRO/KIAMIS integration — stubbed, ready for real credentials
- Ops: Swagger docs, pagination, CSV exports, helmet headers, structured request logging, DB-ping health check, Docker + CI auto-deploy (Vercel/Render)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/animals` | List animals (filter + paginated) |
| `POST` | `/api/animals` | Register animal |
| `PATCH` | `/api/animals/:id/health` | Update health status |
| `GET` | `/api/stats` | Aggregate statistics |
| `GET` | `/api/farmers` | List farmers |
| `GET` | `/api/ref/counties` | 47 Kenya counties (paginated) |
| `GET` | `/api/ref/animal-types` | 6 animal types with breeds (paginated) |
| `GET` | `/api/animals/export` | Animals as CSV (admin/field agent) |
| `GET` | `/api/stats/export` | Stats snapshot as CSV |
| `GET` | `/api/admin/audit-logs/export` | Audit trail as CSV (admin) |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/*` | OTP request/verify, register, refresh, logout |
| `GET`/`PATCH` | `/api/auth/me` | Get / update own profile |
| `GET`/`DELETE` | `/api/auth/sessions` | List / revoke sessions |
| `GET`/`PATCH` | `/api/admin/*` | Users + audit logs (admin only) |

Protected endpoints require `Authorization: Bearer <accessToken>`; the client auto-refreshes on 401. Interactive docs at `/api/docs` (Swagger UI) when the API runs.

## Environment Variables

**API** (`apps/api/.env`): `DATABASE_URL` (blank = in-memory), `JWT_SECRET`, `EMAIL_PROVIDER` (`console`/`smtp`), Brevo `SMTP_*`, `DEFAULT_ADMIN_EMAIL`
**Web** (`apps/web/.env`): `VITE_API_BASE_URL` (blank = mock)
**Mobile** (`apps/mobile/.env`): `EXPO_PUBLIC_API_URL`

## Ops

- **Docs**: Swagger UI at `/api/docs`; OpenAPI JSON at `/api/docs-json`
- **Logging**: every request logged as JSON with `requestId`, method, path, status, duration; response carries `x-request-id`
- **Security**: helmet headers (CSP, HSTS, nosniff, X-Frame-Options); CORS via `CORS_ORIGIN`
- **Health**: `/api/health` pings the DB (`db: ok | in-memory | error`)
- **Deploy**: `render.yaml` (Blueprint) + `.github/workflows/deploy.yml` (Vercel + Render on push) + `docker-compose.yml`

## License

&copy; 2026 Richard Karoki. All rights reserved.