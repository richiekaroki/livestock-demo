# Wam Mfugo — Implementation Plan

**Portfolio goal:** Turn the existing `apps/web/` demo into a full-stack, mobile-ready, deployed project that maps 1:1 to the *Lead Full-Stack Developer (Mifugo360 SuperApp)* role.

**Hosting:** Web frontend → **Vercel** (free) · API backend → **Render** (free) · Database → **Neon/Supabase Postgres** (free).

---

## 0. Cost Summary (everything free)

| Service | Plan | Limits that matter |
| --- | --- | --- |
| Vercel | Hobby | 100 GB bandwidth/mo, free CI for repo |
| Render | Free web service | Spins down after 15 min idle (~50s cold start), 750 hr/mo |
| Neon | Free tier | 0.5 GB storage, always-on branch |
| Supabase (alt) | Free tier | 500 MB Postgres, 2 projects |
| Expo | Free | Expo Go app runs the RN shell on any phone |
| GitHub Actions | Free | 2,000 min/mo |
| Browser/device camera | Free | `getUserMedia` (web), `expo-camera` (RN) |

No credit card required on Vercel, Neon, Expo, or GitHub. Render free tier works without a card for public repos.

---

## 0.5 Current Status (built vs. not yet added)

| Feature | Status | Milestone |
| --- | --- | --- |
| Web SPA (pages, filters, search, analytics, map, export, offline sync) | **DONE** — 151 tests | — |
| Shared package (types, validators, ref data, generator, seed) | **DONE** | — |
| NestJS API (all endpoints, in-memory + Prisma repos) | **DONE** — 21 unit tests + e2e | M1 |
| Data-driven reference system (47 counties, 6 animal types, farmers) | **DONE** | M6 |
| Live Postgres (`DATABASE_URL` + migrations + seed) | **READY** — initial migration + admin seed generated; needs a DB to apply | M1 |
| Render deployment | **NOT YET** | M1 |
| Web → API wiring (`apiClient` / `remoteApi`) | **DONE** — verified live against local API | M2 |
| Real KALRO/KIAMIS sync from the UI | **DONE** — wired via `remoteApi` when online; needs real creds | M2 |
| Vercel deployment | **NOT YET** | M2 |
| Expo / React Native app (`apps/mobile`) | **DONE** — typechecks + bundles; device run pending | M3 |
| Real camera biometric capture (web + mobile) | **DONE** — `getUserMedia` (web) + `expo-camera` (mobile) with fallback | M4 |
| IndexedDB offline storage | **DONE** — Dexie (web) + AsyncStorage (mobile) | M5 |
| GitHub Actions CI | **DONE** — web + api + mobile jobs | §3 |
| Authentication (passwordless email OTP) | **DONE** — JWT access+refresh, roles, rate limit + lockout, audit + sessions, Brevo SMTP (console fallback) | M9 |
| Admin user management | **DONE** — user list/detail/update/deactivate, audit log viewer | M9 |
| Swagger/OpenAPI docs | **DONE** — DocumentBuilder + SwaggerModule at `/api/docs` | M10 |
| Pagination | **DONE** — animals, counties, animal-types (class-validator page/limit, backwards-compatible) | M10 |
| CSV exports | **DONE** — animals (admin/field_agent), stats, audit logs (admin) | M10 |
| Helmet security headers | **DONE** — CSP, HSTS, nosniff, X-Frame-Options | M10 |
| Structured logging + request IDs | **DONE** — JSON logs with requestId, method, path, status, duration | M10 |
| Health check with DB ping | **DONE** — conditional PrismaService, `SELECT 1` when DATABASE_URL set | M10 |
| Docker (API + web + Postgres) | **READY** — Dockerfiles + docker-compose.yml validated; image build needs 6-8 GB RAM | M10 |
| CI auto-deploy | **READY** — `.github/workflows/deploy.yml` (Vercel + Render) + `render.yaml` Blueprint | M10 |
| Package cleanup | **DONE** — removed unused deps (react-is, expo-symbols, expo-web-browser), moved @types/* to devDeps | M10 |
| Swahili/English i18n | **DONE** — react-i18next, EN/SW translations (200+ keys), language switcher | M11 |
| Vaccination reminders (email) | **DONE** — CRUD API, cron scheduler (8AM daily), 3-day advance email reminders | M11 |
| WebSockets live stats | **DONE** — NestJS gateway, socket.io, live indicator on dashboard | M11 |
| Playwright e2e suite | **DONE** — 15 auth flow tests (login, register, protected routes) | M11 |

---

## 1. Target Repository Layout

```
livestock-demo/
├── apps/
│   ├── web/                    # Vite + React 19 SPA (deployed to Vercel)
│   │   └── src/
│   │       ├── components/     # UI components (animals, filters, layout, map,
│   │       │                   #   UserMenu, ProtectedRoute, RoleRoute, OfflineBanner, ...)
│   │       ├── contexts/       # AuthContext (user, token, OTP flow, refresh)
│   │       ├── data/           # re-exports seedLivestock from shared
│   │       ├── hooks/          # useLiveData, useOnlineStatus, useAutoRefresh, ...
│   │       ├── pages/          # Home, Dashboard, MapView, Login, Register, Profile,
│   │       │                   #   admin/UserList, admin/AuditLogs
│   │       ├── services/       # apiClient, remoteApi, mockApi, backend selector
│   │       ├── store/          # Zustand state management
│   │       └── utils/          # offline storage (Dexie), constants, debounce
│   ├── api/                    # NestJS + Prisma + Postgres (deployed to Render)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Animal, Farmer, User, OtpCode, Session, AuditLog,
│   │   │   │                   #   Vaccination, Disease, Outbreak, SyncLog
│   │   │   ├── migrations/     # 20260820000000_init (generated, ready to apply)
│   │   │   └── seed.ts         # generator-backed seed (farmers + animals + admin user)
│   │   └── src/
│   │       ├── main.ts         # NestJS bootstrap (prefix /api, CORS, ValidationPipe, port 4000)
│   │       ├── app.module.ts   # Root module (registers all domain modules)
│   │       ├── auth/           # OTP auth, JWT strategy, guards, sessions, audit,
│   │       │                   #   email (Brevo SMTP), in-memory + Prisma repos
│   │       ├── admin/          # admin user management + audit log endpoints
│   │       ├── animals/        # CRUD + in-memory + Prisma repos
│   │       ├── farmers/        # farmer listing (FM-xxxx codes)
│   │       ├── ref/            # Kenya counties + animal types reference data
│   │       ├── stats/          # aggregate statistics
│   │       ├── kalro/          # KALRO veterinary records (stub)
│   │       ├── kiamis/         # KIAMIS registration (stub)
│   │       ├── outbreaks/      # disease outbreak reporting
│   │       └── health/         # GET /api/health
│   └── mobile/                 # Expo React Native app
│       ├── app/                # expo-router: (auth)/login|register, (tabs)/ index|
│       │                       #   animals|register|map|profile
│       └── src/                # api, storage, useAnimals, camera, contexts/AuthContext
├── packages/
│   └── shared/                 # @wam-mfugo/shared
│       └── src/
│           ├── types/          # Livestock, Farmer, AnimalStats, ApiResponse, ...
│           ├── validation.ts   # validateLivestock, isValidKenyanNationalId, ...
│           ├── ref/            # Kenya counties (47), animal types (6), farmer names
│           ├── generator.ts    # Deterministic PRNG demo data generator
│           ├── seed.ts         # seedLivestock + seedFarmers (generator-derived)
│           └── index.ts        # barrel export
├── docs/
│   ├── DESIGN.md               # design system
│   ├── IMPLEMENTATION.md       # this file
│   ├── AUTH_PLAN.md            # passwordless email OTP auth plan
│   └── HOW_IT_WORKS.txt        # developer onboarding
├── .github/workflows/ci.yml    # CI: web + api + mobile
├── render.yaml                 # Render Blueprint
├── package.json                # npm workspaces (apps/*, packages/*)
└── README.md                   # monorepo overview
```

---

## 2. Milestones

### M1 — Backend: Node + Postgres (deploy to Render)

Build a REST API that exposes **the same contract** the frontend already consumes, so the service layer swaps in without UI changes.

**API surface (mirrors existing frontend code):**

| Method | Path | Frontend equivalent | Response |
| --- | --- | --- | --- |
| `GET` | `/api/animals` | `mockApi.getAnimals(filters)` | `{ success, data, total, page, limit }` |
| `POST` | `/api/animals` | `mockApi.createAnimal(body)` | `{ success, data: Livestock }` |
| `PATCH` | `/api/animals/:id/health` | `mockApi.updateAnimalHealth(id, health)` | `{ success, data }` |
| `GET` | `/api/stats` | `mockApi.getAnimalStatistics()` | `{ success, data: AnimalStats }` |
| `GET` | `/api/farmers` | `mockApi.getFarmers()` | `{ success, data: Farmer[] }` |
| `GET` | `/api/ref/counties` | — | `{ success, data: County[] }` |
| `GET` | `/api/ref/animal-types` | — | `{ success, data: AnimalType[] }` |
| `GET` | `/api/kalro/veterinary/:animalId` | `governmentAPIs.fetchKALROVeterinaryRecords` | `{ success, data: KALROVeterinaryRecord }` |
| `POST` | `/api/kiamis/register` | `governmentAPIs.registerWithKIAMIS` | `{ success, ...KIAMISRegistrationResponse }` |
| `POST` | `/api/outbreaks` | `governmentAPIs.reportDiseaseOutbreak` | `{ success }` |
| `GET` | `/api/health` | — | `{ status: "ok", db: "in-memory" | "configured" }` |
| `POST` | `/api/auth/request-otp` | `remoteApi.requestOtp` | `{ success, data: { message } }` |
| `POST` | `/api/auth/verify-otp` | `remoteApi.verifyOtp` | `{ success, data: AuthResponse }` |
| `POST` | `/api/auth/register` | `remoteApi.register` | `{ success, data: { message } }` |
| `POST` | `/api/auth/refresh` | `remoteApi.refreshToken` | `{ success, data: AuthResponse }` |
| `GET` | `/api/auth/me` | `remoteApi.getMe` | `{ success, data: User }` |
| `PATCH` | `/api/auth/me` | `remoteApi.updateMe` | `{ success, data: User }` |
| `GET` | `/api/admin/users` | — | `{ users, total, page, limit }` (admin) |
| `PATCH` | `/api/admin/users/:id` | — | `{ success, data: User }` (admin) |
| `GET` | `/api/admin/audit-logs` | — | `{ success, data: AuditLogEntry[] }` (admin) |

**Done when:**

- [x] `npm run start:dev` in `apps/api` serves the API on `http://localhost:4000`
- [x] `GET /api/animals` returns seeded data; `POST /api/animals` works in in-memory mode
- [x] API unit tests (6) + e2e tests (5) pass
- [x] `.env.example` committed; real secrets only in `.env` (gitignored)
- [ ] Postgres provisioned (Neon/Supabase) → `npx prisma migrate dev` + `prisma:seed`
- [ ] Deployed to Render free tier; `GET /api/health` returns `ok` from the live URL

---

### M2 — Wire the Web Frontend to the API (deploy to Vercel)

Replace the localStorage mock with a remote client, keeping the offline fallback intact.

**Done when:**

- [x] Web app reads/writes animals through the API when online
- [x] Offline toggle still works fully from IndexedDB cache
- [ ] Deployed to Vercel; live URL loads data from Postgres

---

### M3 — React Native Shell (Expo)

A real mobile app proving the React Native half of the job description.

**Done when:**

- [x] `mobile` app bundles via Metro and typechecks
- [x] Register tab creates an animal (POST `/api/animals`)
- [x] Works offline from `AsyncStorage` cache
- [ ] `mobile` app boots in Expo Go and lists animals from the API (needs deployment)
- [ ] README shows phone screenshots

---

### M4 — Real Camera Biometric Capture

Replace the simulated biometric prototype with actual capture on both platforms.

**Done when:**

- [x] Web Register flow captures a real photo and persists `nosePrintHash` via the API
- [x] Mobile Register flow does the same via Expo camera
- [x] `isBiometricData()` type guard still validates the new payloads

---

### M5 — Offline Hardening (IndexedDB)

Remove the localStorage ceiling so biometric photos don't blow the ~5 MB quota.

**Done when:**

- [x] All offline tests pass against the IndexedDB implementation
- [x] A 300 KB biometric photo persists and reloads offline

---

### M6 — Data-Driven Reference System

Replace all hard-coded animal/farmer/county data with shared reference data from the monorepo.

**What was built:**

- Shared `ref/` package: 47 Kenya counties (IEBC codes, sub-counties, centroids), 6 animal types with breeds and common names, Kenyan farmer name pools
- Deterministic PRNG generator: configurable seed, animal count, farmer count (seed 42 → 23 animals, 8 farmers)
- `Farmer` type with `FM-xxxx` codes, `breed` field on animals, `farmerId` FK
- API: `GET /api/ref/counties`, `GET /api/ref/animal-types`, `GET /api/farmers`
- Web: data-driven county/type/health filter dropdowns, farmer auto-fill on registration
- Mobile: county chips, farmer chips from API, auto-fill on registration

**Done when:**

- [x] All 151 web tests + 6 API tests pass
- [x] Browser smoke test: all pages render, zero console errors
- [x] API endpoints return reference data and generated farmers

---

### M7 — CI (GitHub Actions)

Automated checks on every push/PR.

**Done when:**

- [x] `.github/workflows/ci.yml` running web + api + mobile jobs
- [x] Web: lint, typecheck, tests
- [x] API: prisma generate, lint, build, tests
- [x] Mobile: typecheck

---

### M8 — Deployment (pending: needs your accounts/credentials)

Provision Postgres, deploy API to Render, web to Vercel, run mobile on a device.

**Remaining steps (DB):**

1. Neon → sign up → New Project → create Postgres database → copy `DATABASE_URL`
2. Create `apps/api/.env` and paste `DATABASE_URL`
3. Run: `npx prisma migrate dev` + `npm run prisma:seed`
4. Verify: `GET /api/health` returns `db: "configured"`

**Remaining steps (Render):**

1. Render → New Web Service → connect GitHub repo
2. Root directory: `/`, Build: `npm install && npm run build:api`, Start: `node apps/api/dist/main.js`
3. Env vars: `PORT=4000`, `DATABASE_URL=<neon>`, `CORS_ORIGIN=*`
4. Deploy. Verify: `GET /api/health` returns `ok`

**Remaining steps (Vercel):**

1. Vercel → New Project → import repo → framework Vite → root `apps/web`
2. Set `VITE_API_BASE_URL` to the Render URL
3. Deploy.

---

### M9 — Authentication (done)

Passwordless email OTP authentication with role-based access control.

**See:** `docs/AUTH_PLAN.md` for the full implementation plan.

**What it adds:**

- Email OTP login (6-digit code, 5-min expiry, single-use, SHA-256 hashed)
- Three roles: Admin, Field Agent, Farmer
- JWT access (15 min) + refresh (7 days, rotated) tokens
- Rate limiting + account lockout on OTP
- Session management (list/revoke sessions)
- Audit trail of auth events
- User profile management
- Admin user management UI
- Offline auth handling (cached token, offline banner, refresh when online)

**Implementation order:**

1. Shared types (User, AuthPayload, OTP types) — `packages/shared/src/types/index.ts`
2. Prisma schema (User, OtpCode, Session, AuditLog models + Animal.userId)
3. API dependencies (@nestjs/jwt, passport, passport-jwt, nodemailer)
4. API auth module (AuthService, OTP service, guards, DTOs, email templates)
5. API admin module (AdminService, AdminController, DTOs)
6. API route protection (guards on existing controllers)
7. API tests (OTP request/verify, protected routes)
8. Web auth (AuthContext, Login, Register, Profile, ProtectedRoute, RoleRoute, UserMenu)
9. Web admin pages (UserList, AuditLogs)
10. Mobile auth (AuthContext, login/register/profile screens, conditional nav)
11. Demo mode (in-memory stores, console OTP logging, seeded default admin)
12. Final verification (tests, typecheck, lint, live auth flow against running API)

**Done when:**

- [x] API unit tests (21) + e2e pass
- [x] Web build clean + 151 tests pass
- [x] Mobile typecheck passes
- [x] Auth flow verified end-to-end: OTP → JWT → protected routes → refresh
- [x] Route protection verified: admin route 200 with token, 401 without
- [ ] Live Postgres deploy (apply `prisma/migrations/20260820000000_init` + seed)

---

### M10 — Ops & Documentation (done)

Swagger docs, pagination, CSV exports, security headers, structured logging, Docker, CI auto-deploy.

**What it adds:**

- Swagger UI at `/api/docs` with `@ApiTags` + `@ApiBearerAuth` on all controllers
- Pagination on animals, counties, animal-types endpoints (page/limit, backwards-compatible)
- CSV export for animals, stats, and audit-logs (admin-only)
- Helmet security headers (CSP, HSTS, nosniff, X-Frame-Options)
- Structured JSON request logging with auto-generated `x-request-id`
- Health check with DB ping (`SELECT 1` when `DATABASE_URL` set, `in-memory` when not)
- Docker: multi-stage Dockerfiles for API (node:22-alpine) + web (nginx:alpine), `docker-compose.yml` with Postgres 16
- CI auto-deploy: `.github/workflows/deploy.yml` (Vercel + Render on push to main)
- Package cleanup: removed unused deps, moved `@types/*` to devDependencies

**Done when:**

- [x] API unit tests (21) pass after all changes
- [x] Web tests (151) pass after all changes
- [x] Mobile typecheck passes after all changes
- [x] Swagger UI loads at `/api/docs` with correct base path
- [x] Pagination returns correct page/limit (backwards-compatible when omitted)
- [x] CSV exports return correct headers and content-type
- [x] Response headers include CSP, HSTS, x-request-id
- [ ] Docker image build verified (needs 6-8 GB RAM for WSL2/Windows)

---

### M11 — Portfolio Polish: i18n, Vaccinations, WebSockets, E2E (done)

Swahili/English i18n, vaccination email reminders, live WebSocket stats, Playwright e2e tests.

**What it adds:**

- **i18n:** `react-i18next` with 200+ translated keys (EN/SW), language switcher in navbar, localStorage persistence
- **Vaccinations:** CRUD API (`/api/vaccinations`), `@nestjs/schedule` daily cron (8AM), email reminders 3 days before `nextDueDate`, reminder email template
- **WebSockets:** NestJS `EventsGateway` with Socket.io, `subscribe:stats` + `subscribe:animal-events` channels, `LiveIndicator` component on dashboard, animal event broadcast on create/update
- **Playwright e2e:** 15 tests across login, register, and protected route flows; `playwright.config.ts` with Chromium + webServer auto-start

**Done when:**

- [x] `tsc -b apps/web` passes
- [x] `tsc -b apps/api` passes
- [x] Language switcher toggles EN/SW on all pages
- [x] Vaccination CRUD works via API
- [x] Reminder cron logs upcoming vaccinations
- [x] WebSocket gateway broadcasts animal events
- [x] Playwright config + 15 auth flow tests in `apps/web/e2e/`

---

## 3. CI (GitHub Actions, free)

**`ci.yml`** — runs on push/PR:

1. `web`: `npm ci` → `npm run lint:web` → `npx tsc -b apps/web` → `npm run test:web`
2. `api`: `npm ci` → `npx prisma generate` → `npm run lint:api` → `npm run build:api` → `npm run test:api`
3. `mobile`: `npm ci` → `npm run typecheck:mobile`

**`deploy.yml`** — runs on push to main:

- Vercel: build + deploy web app
- Render: triggers redeploy of API service

---

## 4. README Update

Updated with:

- Lean format (~90 lines) — not bloated
- Mobile app in repository layout
- API endpoints table including ref/farmer/auth/admin/export endpoints
- Shared package description (ref data, generator)
- Auth plan mention (M9 now done — passwordless OTP, roles, JWT)
- Test counts (151 web, 21 API)
- Docker, Swagger, pagination, CSV exports, health check, ops section
- Environment variables section
- Copyright 2026

---

## 5. Order & Time Estimate

| Order | Milestone | Est. time | Why this order |
| --- | --- | --- | --- |
| 1 | M1 backend (built; deploy pending) | ~1–2 days | Everything else depends on the API |
| 2 | M2 frontend wiring + Vercel | ~0.5 day | Instant portfolio URL |
| 3 | M4 web biometrics | ~0.5 day | Small, high-impact, demoable |
| 4 | M3 Expo shell | ~1–2 days | Mobile is the #1 job keyword |
| 5 | M5 IndexedDB | ~0.5 day | Polish + stores large photos |
| 6 | M6 ref data system | ~1 day | Data-driven, no hardcoding |
| 7 | M7 CI | ~0.5 day | Automated checks |
| 8 | M9 auth | ~2–3 days | Passwordless OTP + roles |
| 9 | M8 deployment | ~0.5 day | Needs account credentials |
| 10 | M11 i18n + vaccinations + WebSockets + e2e | ~4–6 days | Portfolio polish, Kenyan market features |

**Total: ~12–17 focused days** to a full-stack, mobile, live, biometric-capable, authenticated, i18n-enabled portfolio.

---

## 6. Interview Talking Points (from this repo)

- **Offline-first:** sync queue + conflict resolution in `livestockStore.syncPendingChanges`; IndexedDB for large biometric photos.
- **Gov integration:** KALRO vet records + KIAMIS registration with Kenyan National ID validation — exact vocabulary in the job post.
- **Data-driven:** 47 Kenya counties, 6 animal types with breeds, deterministic demo generator — no hard-coded data.
- **Perf discipline:** lazy-loaded dashboard, memoized filters/cards, single-pass stats loops, shared `useOnlineStatus`.
- **Testing:** 151 web + 21 API + 15 Playwright e2e tests, type-checked and lint-clean.
- **Monorepo craft:** npm workspaces, shared `@wam-mfugo/shared` package (types + ref data + generator), Prisma repo abstraction with in-memory fallback.
- **Auth:** Passwordless email OTP, no passwords stored, role-based access with JWT access+refresh, rate limiting + lockout, audit trail, session management, admin user management — eliminates password recovery entirely.
- **i18n:** Swahili/English via react-i18next with 200+ translated keys, language switcher, localStorage persistence — demonstrates Kenyan market awareness.
- **Domain features:** Vaccination records with CRUD API, daily cron scheduler for email reminders (3-day advance), shows livestock management domain knowledge.
- **Real-time:** WebSocket gateway (Socket.io) broadcasting animal events, live dashboard indicator — shows modern architecture awareness.
- **API docs:** Swagger UI at `/api/docs`, `@ApiTags` + `@ApiBearerAuth` decorators, OpenAPI JSON export.
- **Ops:** Helmet security headers, structured JSON logging with request IDs, pagination, CSV exports, health check with DB ping, Docker multi-stage builds, CI auto-deploy (Vercel + Render).
