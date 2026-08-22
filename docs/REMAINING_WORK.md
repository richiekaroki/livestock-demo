# Remaining Work — Wam Mfugo

**Last updated:** 2026-08-21
**Status:** 16/17 features complete, 1 partial

---

## Summary

| # | Feature | Status |
|---|---------|--------|
| 1 | Vaccination/disease reminder schedules (email) | **DONE** |
| 2 | CSV export of animals, stats, audit logs | **DONE** |
| 3 | Animal photos/ear-tag images upload | **PARTIAL** — client capture works, no server upload |
| 4 | Swahili/English i18n | **DONE** |
| 5 | Live stats via WebSockets | **DONE** |
| 6 | API pagination on animals + ref endpoints | **DONE** |
| 7 | Playwright e2e suite for auth flow | **DONE** |
| 8 | Docker + docker-compose (Postgres + API + web) | **DONE** |
| 9 | CI auto-deploy (Vercel + Render on push) | **DONE** |
| 10 | Swagger/OpenAPI docs (@nestjs/swagger) | **DONE** |
| 11 | Structured logging + request IDs | **DONE** |
| 12 | Proper CORS + helmet security headers | **DONE** |
| 13 | Health check with DB ping + uptime metrics | **DONE** |
| 14 | Security hardening (OWASP alignment) | **DONE** — JWT guard, CORS whitelist, rate limiting, HttpOnly cookie, email enumeration prevention, OTP invalidation, Nginx headers, Docker secrets, npm audit overrides |

---

## Remaining: Animal Photo Upload

Client-side photo capture and SHA-256 hashing work. S3 config defined. Missing: server upload endpoint.

**What exists:**
- `apps/web/src/components/animals/BiometricCapture.tsx` — browser camera capture
- `apps/web/src/utils/biometrics.ts` — `capturePhoto()`, `hashPhoto()`
- `apps/mobile/src/camera.ts` — expo-camera capture
- `apps/web/src/utils/environment.ts` — S3 config (bucket, region)

**What to build (when needed):**
- `apps/api/src/upload/` — upload module with `POST /api/upload/animal-photo`
- Multer middleware for file handling
- Local filesystem storage (`uploads/` dir) or S3 via `@aws-sdk/client-s3`
- Wire `BiometricCapture.tsx` to POST photos to the upload endpoint

**Estimated effort:** 1–2 days
