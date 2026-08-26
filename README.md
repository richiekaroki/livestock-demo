# Wam Mfugo

Offline-first livestock tracking platform for Kenya. Register animals, monitor health across 47 counties, and sync to KALRO. Passwordless email OTP auth. Swahili/English.

## How Auth Works

Wam Mfugo uses **passwordless email OTP**. There are no passwords.

### Dev Mode (default)

With `DEV_AUTO_VERIFY=true` (the default), both registration and login skip verification:

- **Registration:** Fill form → instant account → signed in
- **Login:** Enter email → instant sign in

No OTP, no emails. Just fill the form and you're in.

### Production Mode

Set `DEV_AUTO_VERIFY=false` and `EMAIL_PROVIDER=smtp` for real verification:

**Registration (Invitation Flow):**
1. Enter your name, email, phone (optional), and county
2. A registration link is sent to your email
3. Click the link — your account is created and you are signed in

No OTP step required for registration. The link is the verification.

**Login:**
1. Enter your email address
2. Receive a 6-digit code by email
3. Enter the code to sign in

That is it. Every user signs in this way, including admins.

### Switching Between Modes

| Setting | Dev (fast) | Production (secure) |
|---------|-----------|-------------------|
| `DEV_AUTO_VERIFY` | `true` | `false` |
| `EMAIL_PROVIDER` | `console` | `smtp` |
| Registration | Instant | Magic link emailed |
| Login | Instant | OTP emailed |

Change these in `apps/api/.env`.

## Demo Account (Testing Only)

A pre-seeded admin account is available for quick testing. This account is **not a real subscription** and is only meant for evaluation.

| Field | Value |
|-------|-------|
| **Name** | Admin User |
| **Email** | `demo@wamfugo.ke` |

**To sign in with the demo account:**
1. Click **Sign In** and enter `demo@wamfugo.ke`
2. With `DEV_AUTO_VERIFY=true`: you're signed in instantly
3. With `DEV_AUTO_VERIFY=false`: check the **API terminal** for the 6-digit code, then enter it

The demo account has **Admin** access. All data resets when you restart the API.

### Dev Auto-Verify

With `DEV_AUTO_VERIFY=true` (the default):
- **Registration:** Fill form → instant account → signed in (no email needed)
- **Login:** Enter email → instant sign in (no OTP needed)

Set to `false` to test the real flow (OTP for login, magic link for registration).

### Abuse protection

- Rate limited: 5 OTP requests per 5 minutes, 5 failed attempts lock the account for 15 minutes
- OTPs expire after 5 minutes
- Registration links expire after 24 hours
- Do not share the OTP publicly. This is for evaluation only.

## Quick Start

```bash
npm install
npm run dev:api     # http://localhost:4000 — start first
npm run dev:web     # http://localhost:5173
```

The API runs in demo mode by default (no database required). OTPs print to the terminal.

For real email delivery, set `EMAIL_PROVIDER=smtp` and configure SMTP credentials in `apps/api/.env`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` / `dev:api` / `dev:mobile` | Start each app |
| `npm run build:web` / `build:api` | Production builds |
| `npm run test:web` / `test:api` / `test:api:e2e` | Tests |
| `npm run typecheck:mobile` | Type-check mobile |
| `npm run lint:web` | Lint web |
| `npm run typecheck:all` | Type-check all 3 apps |
| `npm run test:all` | Run all tests |
| `npm run lint:all` | Lint all apps |

## Structure

```
apps/web          React SPA (auth, admin, maps, charts, offline-first)
apps/api          NestJS API (auth, animals, farmers, stats, KALRO, KIAMIS)
apps/mobile       Expo app (register, camera, map, profile)
packages/shared   Types, Kenya ref data (47 counties, 6 animal types), demo generator
docs/             Security assessment, auth plan, design, features, how it works
```

## Features

- **Auth** — Passwordless email OTP (production), invitation-based registration (magic link), instant dev mode (DEV_AUTO_VERIFY=true), JWT (access + HttpOnly refresh cookie), 3 roles, rate limiting, account lockout, audit trail
- **Animals** — Registration with biometric capture, health tracking, 6 types with breeds, breed-specific naming, edit/delete, photo upload
- **Offline-first** — IndexedDB/AsyncStorage cache, write queue with conflict resolution, reconnection replay
- **Reference data** — 47 Kenya counties (IEBC codes, GPS), 6 animal types with breeds, deterministic demo generator
- **KALRO/KIAMIS** — Integration stubs ready for real credentials
- **i18n** — Swahili/English, 200+ translated keys across web and mobile, language switcher, proper JSON keys
- **Vaccinations** — CRUD API, daily cron scheduler, 3-day advance email reminders
- **Real-time** — Socket.io WebSockets for live stats and animal events
- **Security** — CORS whitelist, CSP, helmet headers, rate limiting, JWT secret enforcement, npm audit overrides
- **Analytics** — Disease prediction, vaccination coverage, mortality tracking, weight gain, county comparison, what-if simulator
- **Farmer features** — Simplified dashboard, QR codes per animal, voice input, photo health assessment
- **Admin** — User management, audit logs, bulk operations, CSV import, KALRO report builder
- **Mobile** — Full feature parity with web, offline queue, push notifications, background sync, bottom tab navigation
- **UI/UX** — Organic Biophilic design system, dark mode, WCAG AA contrast, 44px touch targets, aria-labels, skeleton loading
- **Ops** — Winston structured logging, Swagger/OpenAPI docs, Docker, GitHub Actions CI/CD

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web | React 19, Vite 7, TypeScript, Tailwind 4, Zustand, React Router 7 |
| Mobile | Expo SDK 54, React Native 0.76, expo-router 4, expo-camera |
| API | NestJS 11, Prisma 6, PostgreSQL (in-memory fallback) |
| Shared | @wam-mfugo/shared — types, validators, ref data, generators |
| Real-time | Socket.IO WebSockets |
| Auth | Passwordless email OTP (prod), invitation magic links (prod), instant dev mode, JWT access+refresh, HttpOnly cookie |
| Tests | Vitest (144 web), Jest (21 API), tsc (mobile) |
| Hosting | Vercel (web), Render (API), Neon/Supabase (Postgres) |

## Security

JWT_SECRET enforced on startup, CORS origin whitelist (no wildcards), global rate limiting (3 tiers), HttpOnly refresh cookie, email enumeration prevention, OTP invalidation, invitation tokens with 24h expiry, dev mode auto-verify toggle, CSP + HSTS + helmet headers, Docker secrets via env_file.

## License

&copy; 2026 Richard Karoki. All rights reserved.
