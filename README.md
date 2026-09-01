# Wam Mfugo

Offline-first livestock tracking platform for Kenya. Register animals, monitor health across 47 counties, and sync to KALRO/KIAMIS. Passwordless email OTP auth. Swahili/English. Built with React, Expo, and NestJS.

**[Live: Web](https://wam-mfugo.vercel.app)** | **[API](https://wam-mfugo-demo.onrender.com)** | **Mobile: [EAS Builds](https://expo.dev/accounts/mr.wam)**

---

## Overview

Wam Mfugo is a full-stack livestock management platform designed for Kenyan farmers and veterinary officers. It supports offline-first field operations, real-time monitoring, and integration with national livestock databases.

| Layer | Technology | Status |
|-------|-----------|--------|
| **Web** | React 19, Vite 7, TypeScript, Tailwind 4, Zustand, React Router 7 | Live |
| **Mobile** | Expo SDK 54, React Native 0.81, expo-router 6, Reanimated 4 | Build ready |
| **API** | NestJS 11, Prisma 6, PostgreSQL (in-memory fallback) | Live |
| **Database** | Neon PostgreSQL (serverless) | Connected |
| **CI/CD** | GitHub Actions | Active |
| **Hosting** | Vercel (web), Render (API), EAS (mobile) | Deployed |

---

## Quick Start

```bash
# Clone
git clone https://github.com/richiekaroki/livestock-demo.git
cd livestock-demo

# Install
npm install

# Run all three apps
npm run dev:api      # http://localhost:4000
npm run dev:web      # http://localhost:5173
npm run dev:mobile   # Expo Go
```

The API runs in demo mode by default (no database required). OTPs print to the terminal.

---

## How Auth Works

Wam Mfugo uses **passwordless email OTP**. There are no passwords.

### Dev Mode (default)

With `DEV_AUTO_VERIFY=true`, both registration and login skip verification:

- **Registration:** Fill form → instant account → signed in
- **Login:** Enter email → instant sign in

No OTP, no emails. Just fill the form and you're in.

### Production Mode

Set `DEV_AUTO_VERIFY=false` and `EMAIL_PROVIDER=smtp`:

**Registration (Invitation Flow):**
1. Enter your name, email, phone (optional), and county
2. A registration link is sent to your email
3. Click the link — account created and signed in

**Login:**
1. Enter your email address
2. Receive a 6-digit code by email
3. Enter the code to sign in

### Mode Comparison

| Setting | Dev (fast) | Production (secure) |
|---------|-----------|-------------------|
| `DEV_AUTO_VERIFY` | `true` | `false` |
| `EMAIL_PROVIDER` | `console` | `smtp` |
| Registration | Instant | Magic link emailed |
| Login | Instant | OTP emailed |

---

## Demo Account

A pre-seeded admin account for quick testing:

| Field | Value |
|-------|-------|
| **Email** | `demo@wamfugo.ke` |
| **Access** | Admin |

With `DEV_AUTO_VERIFY=true`: enter email → signed in instantly. With `DEV_AUTO_VERIFY=false`: check the API terminal for the 6-digit code.

---

## Project Structure

```
livestock-demo/
├── apps/
│   ├── web/                    # React SPA
│   │   └── src/
│   │       ├── pages/          # 25 pages (Dashboard, Outbreaks, Simulator, etc.)
│   │       ├── components/     # UI components (animals, analytics, layout, map)
│   │       ├── hooks/          # Custom hooks (WebSocket, live data, counties)
│   │       ├── services/       # API clients (remote, mock, offline)
│   │       ├── contexts/       # Auth context
│   │       ├── store/          # Zustand state
│   │       ├── locales/        # en/ sw/ translations
│   │       └── utils/          # Biometrics, offline storage, constants
│   │
│   ├── api/                    # NestJS API
│   │   └── src/
│   │       ├── auth/           # OTP, JWT, sessions, invitations
│   │       ├── animals/        # Registration, CRUD, photo upload
│   │       ├── diseases/       # Prediction, risk assessment, simulator
│   │       ├── vaccinations/   # CRUD, reminders, cron scheduler
│   │       ├── mortality/      # Tracking, stats, cause analysis
│   │       ├── weight/         # Records, gain analytics
│   │       ├── outbreaks/      # Reporting, status management
│   │       ├── health/         # Assessment, alerts
│   │       ├── farmers/        # Management
│   │       ├── stats/          # Dashboard, county comparison
│   │       ├── events/         # WebSocket gateway
│   │       ├── kalro/          # KALRO integration
│   │       ├── kiamis/         # KIAMIS integration
│   │       ├── notifications/  # Push notifications
│   │       ├── upload/         # Photo upload
│   │       ├── admin/          # User management, audit logs
│   │       └── common/         # Prisma, Winston, middleware
│   │
│   └── mobile/                 # Expo app
│       ├── app/
│       │   ├── (tabs)/         # 21 tab screens
│       │   ├── (auth)/         # Login, register, verify
│       │   └── admin/          # Audit logs, users
│       └── src/
│           ├── components/     # Reusable UI (Card, Button, Badge, EmptyState)
│           ├── services/       # API, offline queue, socket, camera, haptics
│           ├── contexts/       # Auth context
│           └── hooks/          # Animal data hooks
│
├── packages/shared/            # Shared package
│   └── src/
│       ├── types/              # TypeScript interfaces
│       ├── validation.ts       # Zod schemas
│       ├── seed.ts             # Demo data
│       ├── generator.ts        # Deterministic ID generator
│       └── ref/                # 47 counties, 6 animal types, breeds
│
├── docs/                       # Documentation
├── .github/workflows/          # CI/CD (ci, deploy, eas-build)
├── docker-compose.yml          # Postgres + API + Web
└── render.yaml                 # Render deployment config
```

---

## Features

### Core
- **Passwordless Auth** — Email OTP (production), invitation magic links, instant dev mode, JWT access + HttpOnly refresh cookie, 3 roles (Admin, Field Agent, Viewer)
- **Animal Registration** — Biometric capture (face + horns + ear tag), photo upload, breed-specific naming, 6 animal types with breeds
- **Offline-First** — IndexedDB/AsyncStorage cache, write queue with conflict resolution, reconnection replay, background sync

### Analytics & Monitoring
- **Dashboard** — Real-time stats via WebSocket, county-level breakdown, animal type distribution
- **Disease Prediction** — Risk assessment engine, environmental factor analysis, what-if simulator
- **Vaccination Coverage** — County comparison, coverage percentages, type breakdown, daily cron scheduler with 3-day advance email reminders
- **Mortality Tracking** — Cause analysis, county breakdown, time-series trends
- **Weight Gain Analytics** — Per-animal tracking, gain percentages, record counts
- **County Comparison** — Side-by-side metrics across 47 counties (health, vaccination, mortality, outbreaks)
- **Outbreak Management** — Report, track, update disease outbreaks with GPS coordinates

### Operations
- **Bulk Operations** — Batch health status updates (max 200 per request)
- **CSV Import** — Upload animal data from spreadsheets with validation
- **KALRO Report Builder** — Generate formatted reports for Kenya Agricultural and Livestock Research Organization
- **QR Codes** — Per-animal QR codes for field identification
- **Health Assessment** — Photo-based health scoring with AI assistance

### Integration
- **KALRO/KIAMIS** — Integration stubs ready for real credentials
- **Push Notifications** — Expo push notifications for health alerts and outbreaks
- **Real-Time** — Socket.io WebSockets for live stats and animal events

### Mobile (Expo SDK 54)
- **Full Feature Parity** — 21 tab screens matching web functionality
- **Camera Integration** — Biometric photo capture during registration
- **Offline Queue** — Actions queued and replayed on reconnection
- **Background Sync** — Automatic data synchronization
- **Haptic Feedback** — Native touch feedback
- **Spring Animations** — Reanimated 4 powered UI transitions
- **i18n** — English/Swahili with 200+ translated keys

### UI/UX
- **Biophilic Design** — Organic, nature-inspired design system
- **Dark Mode** — Full theme support with system preference detection
- **Accessibility** — WCAG AA contrast, 44px touch targets, aria-labels
- **Loading States** — Skeleton screens, delayed unmount transitions
- **Responsive** — Mobile-first with desktop optimization

### Security
- CORS origin whitelist (no wildcards)
- CSP + HSTS + helmet headers
- Global rate limiting (3 tiers)
- OTP rate limiting (5 requests/5 min, 5 failed attempts → 15 min lockout)
- JWT secret enforcement on startup
- CSV injection sanitization
- Email enumeration prevention
- `DEV_AUTO_VERIFY` blocked in production

---

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/request-otp`, `POST /api/auth/verify-otp`, `POST /api/auth/register`, `POST /api/auth/verify-registration`, `POST /api/auth/refresh`, `POST /api/auth/logout` |
| Animals | `GET/POST /api/animals`, `GET/PATCH/DELETE /api/animals/:id`, `POST /api/animals/:id/photo` |
| Vaccinations | `GET/POST /api/vaccinations`, `PATCH/DELETE /api/vaccinations/:id`, `GET /api/vaccinations/reminders` |
| Mortality | `GET/POST /api/mortality`, `DELETE /api/mortality/:id`, `GET /api/mortality/stats` |
| Weight | `GET/POST /api/weight`, `DELETE /api/weight/:id`, `GET /api/weight/stats` |
| Outbreaks | `GET/POST /api/outbreaks`, `PATCH /api/outbreaks/:id` |
| Diseases | `GET /api/diseases/risk`, `POST /api/diseases/predict/risk`, `POST /api/diseases/simulate` |
| Health | `POST /api/health-assessment` |
| Stats | `GET /api/stats/dashboard`, `GET /api/stats/county-comparison` |
| Farmers | `GET /api/farmers` |
| Upload | `POST /api/upload/animal-photo` |
| Health Check | `GET /api/health` |
| Ref | `GET /api/ref/counties`, `GET /api/ref/animal-types` |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:api` | Start API server (port 4000) |
| `npm run dev:web` | Start web dev server (port 5173) |
| `npm run dev:mobile` | Start Expo dev server |
| `npm run dev:mobile:tunnel` | Start with ngrok tunnel (phone testing) |
| `npm run build` | Build all apps |
| `npm run build:web` / `build:api` | Build individual apps |
| `npm run test` | Run all tests |
| `npm run test:web` / `test:api` / `test:mobile` | Run individual test suites |
| `npm run lint` | Lint all apps |
| `npm run typecheck` | Type-check all apps |
| `npm run typecheck:mobile` | Type-check mobile only |

---

## Environment Variables

### API (`apps/api/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | (empty = in-memory) |
| `PORT` | Server port | `4000` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `OTP_EXPIRY_MINUTES` | OTP validity window | `5` |
| `OTP_MAX_REQUESTS` | Max OTP requests per window | `5` |
| `OTP_LOCKOUT_MINUTES` | Lockout after failed attempts | `15` |
| `EMAIL_PROVIDER` | `console` (dev) or `smtp` (prod) | `console` |
| `DEV_AUTO_VERIFY` | Skip OTP in dev mode | `true` |
| `SMTP_HOST` | SMTP server host | `smtp-relay.brevo.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | (required for smtp) |
| `SMTP_PASS` | SMTP password | (required for smtp) |
| `SMTP_FROM` | Sender email address | (required for smtp) |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | (required) |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `DEFAULT_ADMIN_EMAIL` | Default admin account email | `demo@wamfugo.ke` |

### Web (`apps/web/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API server URL | `http://localhost:4000` |
| `VITE_OFFLINE_MODE` | Force offline mode | `false` |

---

## Deployment

### Web (Vercel)
1. Import `richiekaroki/livestock-demo` on Vercel
2. Root directory: `apps/web`
3. Set `VITE_API_BASE_URL` environment variable

### API (Render)
1. New Web Service from GitHub repo
2. Build: `npm ci && npm run build:api`
3. Start: `node apps/api/dist/main.js`
4. Set environment variables (see table above)
5. Connect to Neon/Supabase PostgreSQL

### Mobile (EAS)
1. `npx eas login`
2. `npx eas build --profile production`
3. Submit to App Store / Play Store

### Docker
```bash
docker-compose up -d    # Postgres + API + Web
```

---

## CI/CD

| Workflow | Trigger | Actions |
|----------|---------|---------|
| **CI** | Push to main, PRs | Lint, typecheck, test (web, API, mobile) |
| **Deploy** | Push to main | Auto-deploy web (Vercel) + API (Render) |
| **EAS Build** | Push to main | Build mobile apps for iOS/Android |

---

## Tech Details

- **Monorepo**: Turborepo with npm workspaces
- **Database**: Prisma ORM with PostgreSQL (Neon serverless), in-memory fallback for demo
- **Auth**: Stateless JWT with HttpOnly refresh cookie, 15min access + 7d refresh
- **Real-time**: Socket.io with WebSocket transport, automatic reconnection
- **State**: Zustand (web), React Context (mobile)
- **Styling**: Tailwind CSS 4 (web), StyleSheet (mobile)
- **Testing**: Vitest (web, 144 tests), Jest (API, 21 tests), tsc (mobile)
- **Build**: Vite 7 (web), NestJS CLI (API), Expo SDK 54 (mobile)

---

## License

&copy; 2026 Richard Karoki. All rights reserved.
