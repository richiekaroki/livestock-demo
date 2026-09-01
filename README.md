# Wam Mfugo

Offline-first livestock tracking platform for Kenya. Register animals, monitor health across 47 counties, and sync to KALRO/KIAMIS.

**[Live Web](https://wam-mfugo.vercel.app)** · **[API Docs](https://wam-mfugo-demo.onrender.com/api/health)** · **[Mobile Builds](https://expo.dev/accounts/mr.wam)**

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Web** | React 19, Vite 7, TypeScript, Tailwind 4, Zustand |
| **Mobile** | Expo SDK 54, React Native 0.81, Reanimated 4 |
| **API** | NestJS 11, Prisma 6, PostgreSQL (Neon) |
| **CI/CD** | GitHub Actions, Vercel, Render, EAS |

---

## Quick Start

```bash
git clone https://github.com/richiekaroki/livestock-demo.git
cd livestock-demo
npm install

npm run dev:api      # localhost:4000
npm run dev:web      # localhost:5173
npm run dev:mobile   # Expo Go
```

Demo mode: OTPs print to terminal, no database required.

---

## Features

**Core** — Passwordless email OTP auth, biometric animal registration, offline-first with sync queue, 3 user roles

**Analytics** — Real-time dashboard, disease prediction, vaccination tracking, mortality analysis, county comparison across 47 counties

**Operations** — Bulk health updates, CSV import, KALRO report builder, QR codes, outbreak management

**Mobile** — Full feature parity, camera integration, background sync, haptic feedback, English/Swahili

**Security** — Rate limiting, CORS whitelist, HSTS, JWT + HttpOnly refresh cookie, CSV injection prevention

---

## Scripts

```bash
npm run dev:api          # API server
npm run dev:web          # Web dev server
npm run dev:mobile       # Expo dev
npm run build            # Build all
npm run test             # Run all tests
npm run lint             # Lint all
npm run typecheck        # Type-check all
```

---

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | (in-memory) |
| `JWT_SECRET` | JWT signing key | (required) |
| `EMAIL_PROVIDER` | `console` or `smtp` | `console` |
| `DEV_AUTO_VERIFY` | Skip OTP in dev | `true` |
| `CORS_ORIGIN` | Allowed origins | (required) |

See `apps/api/.env` for full list.

---

## License

© 2026 Richard Karoki. All rights reserved.
