# Features

**Last updated:** 2026-09-01

---

## Core

| Feature | Web | Mobile | API |
|---------|-----|--------|-----|
| Passwordless OTP auth | ✓ | ✓ | ✓ |
| Biometric animal registration | ✓ | ✓ | ✓ |
| Animal CRUD + photo upload | ✓ | ✓ | ✓ |
| Offline-first with sync queue | — | ✓ | — |
| 3 user roles (Admin/Agent/Viewer) | ✓ | ✓ | ✓ |

## Analytics

| Feature | Web | Mobile | API |
|---------|-----|--------|-----|
| Real-time dashboard (WebSocket) | ✓ | ✓ | ✓ |
| Disease prediction engine | ✓ | ✓ | ✓ |
| Vaccination tracking + reminders | ✓ | ✓ | ✓ |
| Mortality tracking + stats | ✓ | ✓ | ✓ |
| Weight gain analytics | ✓ | ✓ | ✓ |
| County comparison (47 counties) | ✓ | — | ✓ |
| What-if simulator | ✓ | — | ✓ |

## Operations

| Feature | Web | Mobile | API |
|---------|-----|--------|-----|
| Bulk health updates | ✓ | ✓ | ✓ |
| CSV import/export | ✓ | ✓ | ✓ |
| KALRO report builder | ✓ | — | ✓ |
| QR codes per animal | ✓ | — | ✓ |
| Photo health assessment | ✓ | — | ✓ |
| Outbreak reporting | ✓ | ✓ | ✓ |

## Infrastructure

| Feature | Status |
|---------|--------|
| CI/CD (GitHub Actions) | ✓ 4 workflows |
| Rate limiting (3 tiers) | ✓ |
| CORS + HSTS + CSP | ✓ |
| Structured logging (Winston) | ✓ |
| DB backups (daily pg_dump) | ✓ |
| Health check (DB + memory) | ✓ |

## UI/UX

| Feature | Web | Mobile |
|---------|-----|--------|
| Dark mode | ✓ | ✓ |
| English/Swahili | ✓ | ✓ |
| Responsive layout | ✓ | — |
| Touch feedback + haptics | — | ✓ |
| Spring animations | — | ✓ |

## Tests

| App | Framework | Count |
|-----|-----------|-------|
| Web | Vitest | 144 |
| API | Jest + Supertest | 21 |
| Mobile | TypeScript | Type-check |
| Load | k6 | Configurable |
