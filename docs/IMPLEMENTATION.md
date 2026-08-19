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
| NestJS API (all endpoints, in-memory + Prisma repos) | **DONE** — 6 unit + 5 e2e tests | M1 |
| Data-driven reference system (47 counties, 6 animal types, farmers) | **DONE** | M6 |
| Live Postgres (`DATABASE_URL` + migrations + seed) | **NOT YET** — API runs in-memory only | M1 |
| Render deployment | **NOT YET** | M1 |
| Web → API wiring (`apiClient` / `remoteApi`) | **DONE** — verified live against local API | M2 |
| Real KALRO/KIAMIS sync from the UI | **DONE** — wired via `remoteApi` when online; needs real creds | M2 |
| Vercel deployment | **NOT YET** | M2 |
| Expo / React Native app (`apps/mobile`) | **DONE** — typechecks + bundles; device run pending | M3 |
| Real camera biometric capture (web + mobile) | **DONE** — `getUserMedia` (web) + `expo-camera` (mobile) with fallback | M4 |
| IndexedDB offline storage | **DONE** — Dexie (web) + AsyncStorage (mobile) | M5 |
| GitHub Actions CI | **DONE** — web + api + mobile jobs | §3 |
| Authentication (passwordless email OTP) | **NOT YET** — plan at `docs/AUTH_PLAN.md` | M9 |
| Admin user management | **NOT YET** | M9 |
| README live links + architecture diagram | **NOT YET** | §4 |

---

## 1. Target Repository Layout

```
livestock-demo/
├── apps/
│   ├── web/                    # Vite + React 19 SPA (deployed to Vercel)
│   │   └── src/
│   │       ├── components/     # UI components (animals, filters, layout, map, ...)
│   │       ├── data/           # re-exports seedLivestock from shared
│   │       ├── hooks/          # useLiveData, useOnlineStatus, useAutoRefresh, ...
│   │       ├── pages/          # Home, Dashboard, MapView
│   │       ├── services/       # apiClient, remoteApi, mockApi, backend selector
│   │       ├── store/          # Zustand state management
│   │       └── utils/          # offline storage (Dexie), constants, debounce
│   ├── api/                    # NestJS + Prisma + Postgres (deployed to Render)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Animal, Farmer, Vaccination, Disease, Outbreak, SyncLog
│   │   │   └── seed.ts         # generator-backed seed (farmers + animals with breed/farmerId)
│   │   └── src/
│   │       ├── main.ts         # NestJS bootstrap (prefix /api, CORS, ValidationPipe, port 4000)
│   │       ├── app.module.ts   # Root module (registers all domain modules)
│   │       ├── auth/           # (planned) OTP auth, JWT, guards — see AUTH_PLAN.md
│   │       ├── animals/        # CRUD + in-memory + Prisma repos
│   │       ├── farmers/        # farmer listing (FM-xxxx codes)
│   │       ├── ref/            # Kenya counties + animal types reference data
│   │       ├── stats/          # aggregate statistics
│   │       ├── kalro/          # KALRO veterinary records (stub)
│   │       ├── kiamis/         # KIAMIS registration (stub)
│   │       ├── outbreaks/      # disease outbreak reporting
│   │       └── health/         # GET /api/health
│   └── mobile/                 # Expo React Native app (4 tabs)
│       ├── app/                # expo-router: (tabs)/ index|animals|register|map
│       └── src/                # api, storage, useAnimals, camera
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

### M9 — Authentication (planned)

Passwordless email OTP authentication with role-based access control.

**See:** `docs/AUTH_PLAN.md` for the full implementation plan.

**What it adds:**
- Email OTP login (6-digit code, 5-min expiry)
- Three roles: Admin, Field Agent, Farmer
- JWT access + refresh tokens
- Rate limiting + account lockout on OTP
- User profile management
- Admin user management UI
- Offline auth handling

**Implementation order:**
1. Shared types (User, AuthPayload, OTP types)
2. Prisma schema (User + OtpCode models)
3. API dependencies (@nestjs/jwt, passport, passport-jwt)
4. API auth module (AuthService, OTP service, guards, DTOs)
5. API route protection (guards on existing controllers)
6. API tests (OTP request/verify, protected routes)
7. Web auth (AuthContext, Login, Register, ProtectedRoute)
8. Mobile auth (AuthContext, login/register screens)
9. Demo mode (in-memory stores, console OTP logging, default admin)
10. Final verification (tests, typecheck, lint, browser smoke test)

---

## 3. CI (GitHub Actions, free)

`.github/workflows/ci.yml` running on push/PR:
1. `web`: `npm ci` → `npm run lint:web` → `npx tsc -b apps/web` → `npm run test:web`
2. `api`: `npm ci` → `npx prisma generate` → `npm run lint:api` → `npm run build:api` → `npm run test:api`
3. `mobile`: `npm ci` → `npm run typecheck:mobile`

---

## 4. README Update

Updated with:
- Mobile app in repository layout
- API endpoints table including ref/farmer endpoints
- Shared package description (ref data, generator)
- Auth plan mention
- Test counts (151 web, 6 API)
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

**Total: ~7–9 focused days** to a full-stack, mobile, live, biometric-capable, authenticated portfolio.

---

## 6. Interview Talking Points (from this repo)

- **Offline-first:** sync queue + conflict resolution in `livestockStore.syncPendingChanges`; IndexedDB for large biometric photos.
- **Gov integration:** KALRO vet records + KIAMIS registration with Kenyan National ID validation — exact vocabulary in the job post.
- **Data-driven:** 47 Kenya counties, 6 animal types with breeds, deterministic demo generator — no hard-coded data.
- **Perf discipline:** lazy-loaded dashboard, memoized filters/cards, single-pass stats loops, shared `useOnlineStatus`.
- **Testing:** 151 web + 6 API tests, type-checked and lint-clean.
- **Monorepo craft:** npm workspaces, shared `@wam-mfugo/shared` package (types + ref data + generator), Prisma repo abstraction with in-memory fallback.
- **Auth (planned):** Passwordless email OTP, no passwords stored, role-based access — eliminates password recovery entirely.
