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
| CI/CD (GitHub Actions) | ✓ 5 workflows |
| Rate limiting (3 tiers) | ✓ |
| CORS + HSTS + CSP | ✓ |
| Structured logging (Winston) | ✓ |
| DB backups (daily pg_dump) | ✓ |
| Health check (DB + memory) | ✓ |
| WebSocket JWT auth | ✓ |
| JWT audience differentiation | ✓ |
| Session ownership checks | ✓ |
| Role guards on all endpoints | ✓ |

## Security

| Feature | Status |
|---------|--------|
| Rate limiting (3 tiers) | ✓ |
| CORS whitelist | ✓ |
| HSTS + CSP headers | ✓ |
| JWT + HttpOnly refresh cookie | ✓ |
| JWT audience (access vs refresh) | ✓ |
| WebSocket JWT verification | ✓ |
| OTP never returned in production | ✓ |
| Session revocation ownership | ✓ |
| Push token ownership | ✓ |
| KALRO input sanitization | ✓ |
| CSV injection prevention | ✓ |
| Role-based access control | ✓ |

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
