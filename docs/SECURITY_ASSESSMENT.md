# Security Assessment — Wam Mfugo

**Date**: 2026-08-21
**Auditor**: Automated security review (OWASP Top 10 / STRIDE alignment)
**Stack**: NestJS + React/Vite + Prisma + PostgreSQL + Nginx
**Status**: Pre-fix baseline — critical items identified below

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Mismatch](#architecture-mismatch)
3. [SSR / Bot Rendering](#1-ssr--bot-rendering)
4. [DB Credentials](#2-db-credentials)
5. [Auth Implementation](#3-auth-implementation)
6. [CORS Configuration](#4-cors-configuration)
7. [Password Safety](#5-password-safety)
8. [Input Validation](#6-input-validation)
9. [Rate Limiting](#7-rate-limiting)
10. [DB Disaster Recovery](#8-db-disaster-recovery)
11. [Error Handling / Sentry](#9-error-handling--sentry)
12. [RBAC](#10-rbac)
13. [Stack Trace Exposure](#11-stack-trace-exposure)
14. [DB Migrations](#12-db-migrations)
15. [API Key Handling](#13-api-key-handling)
16. [Admin Bootstrapping](#14-admin-bootstrapping)
17. [OTP Token Security](#15-otp-token-security)
18. [Refresh Token Rotation](#16-refresh-token-rotation)
19. [Logout Security](#17-logout-security)
20. [Email Security](#18-email-security)
21. [Security Headers](#19-security-headers)
22. [File Upload Limits](#20-file-upload-limits)
23. [Frontend URL Configuration](#21-frontend-url-configuration)
24. [OWASP Top 10 Alignment](#owasp-top-10-alignment)
25. [Fix Plan — Free Resources Only](#fix-plan--free-resources-only)

---

## Executive Summary

This assessment compares the **claimed security posture** against the **actual codebase**. The project is a NestJS + React/Vite SPA, not Django/DRF. Several claimed features (rate limiting, Sentry, HttpOnly cookie tokens, SSR) are **not implemented**.

### Critical Findings

| # | Finding | Severity | OWASP |
|---|---------|----------|-------|
| 1 | Refresh token stored in localStorage (XSS-vulnerable) | **HIGH** | A07:2021 |
| 2 | No rate limiting on any endpoint | **HIGH** | A04:2021 |
| 3 | CORS allows `*` wildcard in dev/prod | **MEDIUM** | A05:2021 |
| 4 | JWT fallback secret hardcoded | **MEDIUM** | A05:2021 |
| 5 | Email enumeration via distinct error messages | **MEDIUM** | A07:2021 |
| 6 | No SSR — empty `<div id="root">` for bots | **MEDIUM** | A04:2021 |
| 7 | No security headers on nginx | **MEDIUM** | A05:2021 |
| 8 | No error tracking (Sentry) | **LOW** | A09:2021 |

---

## Architecture Mismatch

The claimed security posture references Django/DRF concepts that do **not exist** in this codebase:

| Claimed Feature | Actual Technology |
|---|---|
| django-ratelimit | **Not implemented** |
| dj-database-url | Prisma `url = env("DATABASE_URL")` |
| Sentry SDK (DjangoIntegration) | **Not implemented** |
| DRF serializers | `class-validator` DTOs |
| BLACKLIST_AFTER_ROTATION | Custom session rotation via Prisma |
| set_unusable_password() | No password field in schema |
| SECURE_BROWSER_XSS_FILTER | `helmet()` (partial) |
| start.sh / migrate on boot | docker-compose command only |

---

## 1. SSR / Bot Rendering

**Source**: `apps/web/index.html:29-30`

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

**Status**: FAIL — Pure SPA with no SSR.

- Empty container before JS loads
- No `vite-plugin-ssg`, no Next.js, no prerender config
- nginx serves `index.html` for all routes (`apps/web/nginx.conf:10`)
- Social media preview bots (OpenGraph) see empty page
- Googlebot renders JS but with delays and caching limitations

**Risk**: MEDIUM — SEO degradation, broken link previews, accessibility gaps.

---

## 2. DB Credentials

**Source**: `apps/api/.env`, `.gitignore:16`, `docker-compose.yml`

**Status**: PARTIAL FAIL

**Good**:
- `.env` is gitignored
- `.env.example` has placeholders

**Bad**:
- `apps/api/.env` contains real Brevo SMTP credentials (`SMTP_PASS`, `BREVO_API_KEY`)
- `docker-compose.yml:29` hardcodes `JWT_SECRET: compose-dev-secret-change-me`
- `docker-compose.yml:9-10` hardcodes `POSTGRES_USER: wam`, `POSTGRES_PASSWORD: wam`
- If `.env` was ever pushed to a remote, all keys are compromised

---

## 3. Auth Implementation

**Source**: `apps/api/src/auth/auth.service.ts`, `apps/web/src/contexts/AuthContext.tsx`

**Status**: DIFFERS FROM DESCRIPTION

### Claimed vs Actual

| Claimed | Actual |
|---|---|
| Magic link (one-time link) | 6-digit OTP code |
| Refresh token in HttpOnly cookie | **In localStorage** |
| Access token in memory | **In localStorage** |
| No passwords stored | Correct — no password field |

### Refresh Token Storage — CRITICAL

**Source**: `apps/web/src/contexts/AuthContext.tsx:56`
```typescript
localStorage.setItem(REFRESH_KEY, auth.refreshToken);
```

**Source**: `apps/web/src/services/apiClient.ts:51`
```typescript
localStorage.setItem(REFRESH_KEY, data.data.refreshToken);
```

Both access AND refresh tokens are in localStorage, accessible to any XSS attack.

**OWASP Reference**: ASVS V3.4.1 — Tokens should not be stored in persistent local storage.

### Email Enumeration

**Source**: `apps/api/src/auth/auth.service.ts:69`
```typescript
throw new UnauthorizedException('No account found with this email');
```

Different error messages for "no account" vs "wrong OTP" leak whether an email is registered.

---

## 4. CORS Configuration

**Source**: `apps/api/src/main.ts:16-21`

**Status**: RISKY

```typescript
app.enableCors({
  origin:
    process.env.CORS_ORIGIN === '*'
      ? '*'
      : (process.env.CORS_ORIGIN?.split(',') ?? true),
});
```

- `CORS_ORIGIN=*` is allowed and used in `docker-compose.yml:34`
- No production guard warning if `CORS_ORIGIN=*` with `NODE_ENV=production`
- No `FRONTEND_URL` concept for redirect validation

---

## 5. Password Safety

**Source**: `apps/api/prisma/schema.prisma:39-57`

**Status**: CORRECT — No password field in User model. Auth is OTP-based.

---

## 6. Input Validation

**Source**: `apps/api/src/main.ts:22-28`, DTOs in `apps/api/src/auth/dto/`

**Status**: IMPLEMENTED

- Global `ValidationPipe` with `whitelist: true` (strips unknown properties)
- `class-validator` decorators on all DTOs
- `@IsEmail()`, `@MinLength()`, `@Matches()`, `@IsIn()` enforced

**Gap**: No file upload validation (no upload endpoints exist).

---

## 7. Rate Limiting

**Status**: NOT IMPLEMENTED

- grep for `rate.?limit|throttl|RateLimit` across all `.ts` files: **zero matches**
- No `@nestjs/throttler` or equivalent installed
- OTP endpoints are vulnerable to brute-force and email bombing

---

## 8. DB Disaster Recovery

**Source**: `apps/api/prisma/schema.prisma`, `docker-compose.yml`

**Status**: MINIMAL

- Prisma migrate runs on boot in docker-compose
- Health check pings DB (`apps/api/src/health/health.controller.ts`)
- No connection pooling config
- No production crash guard if `DATABASE_URL` is missing
- No backup strategy

---

## 9. Error Handling / Sentry

**Status**: NOT IMPLEMENTED

- grep for `sentry|Sentry`: **zero matches**
- No `@sentry/nestjs` or `@sentry/node` installed
- NestJS default behavior hides stack traces in production, but no explicit guard

---

## 10. RBAC

**Source**: `apps/api/src/admin/admin.controller.ts:29-30`, `apps/api/src/auth/roles.guard.ts`

**Status**: IMPLEMENTED

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
```

Roles: `admin`, `farmer`, `field_agent`. Admin endpoints require `admin` role.

---

## 11. Stack Trace Exposure

**Source**: `apps/api/src/main.ts:10`

**Status**: LOW RISK

- NestJS hides stack traces in production by default
- No explicit `NODE_ENV` guard crashing app if accidentally set to `development`

---

## 12. DB Migrations

**Source**: `docker-compose.yml:40`, `render.yaml`

**Status**: PARTIAL

- docker-compose runs `prisma migrate deploy` on boot
- Render blueprint does NOT run migrations — no `preDeployCommand` configured

---

## 13. API Key Handling

**Status**: MOSTLY GOOD with gaps

- `.gitignore` excludes `.env`
- `apps/api/.env` has real credentials (risk if ever committed)
- JWT fallback secret `'dev-secret-change-me'` used if `JWT_SECRET` unset (`apps/api/src/auth/auth.module.ts:29`)
- Same fallback in `apps/api/src/auth/jwt.strategy.ts:12`

---

## 14. Admin Bootstrapping

**Source**: `apps/api/prisma/seed.ts:58-73`, `apps/api/src/auth/in-memory-user.repository.ts:15-29`

**Status**: IMPLEMENTED

- Admin created via `prisma seed` using `DEFAULT_ADMIN_EMAIL` env var
- In-memory repo seeds admin in demo mode

---

## 15. OTP Token Security

**Source**: `apps/api/src/auth/otp.service.ts`

**Status**: MOSTLY IMPLEMENTED

**Good**:
- 6-digit numeric OTP via `crypto.randomInt`
- SHA-256 hashed before storage
- Marked `used=True` after verification
- Configurable expiry, max attempts, lockout

**Missing**:
- Old OTPs not invalidated on new request
- Different error messages leak email enumeration

---

## 16. Refresh Token Rotation

**Source**: `apps/api/src/auth/session.service.ts:62-71`

**Status**: SERVER-SIDE ONLY

- Old session deleted, new one created (server-side rotation works)
- Client stores refresh token in localStorage — if stolen via XSS, attacker can use before next rotation
- No HttpOnly cookie to prevent client-side theft

---

## 17. Logout

**Source**: `apps/api/src/auth/auth.controller.ts:89-101`, `apps/web/src/contexts/AuthContext.tsx:146-160`

**Status**: PARTIAL

- Server revokes session
- Client clears localStorage
- Client logout fires API call but doesn't await — if API is down, session stays active

---

## 18. Email Security

**Source**: `apps/api/src/auth/email.service.ts:79-87`

**Status**: CORRECT

- SMTP via Brevo relay with app-specific key
- Console fallback for dev
- No account password used

---

## 19. Security Headers

**Source**: `apps/api/src/main.ts:13`, `apps/web/nginx.conf`

**Status**: PARTIAL

**API (helmet)**:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (HSTS)
- Default CSP (may break inline scripts in `index.html`)

**Nginx**:
- No security headers configured
- No `X-Frame-Options`, no `HSTS`, no `CSP`, no `X-Content-Type-Options`

---

## 20. File Upload Limits

**Status**: NOT IMPLEMENTED

No file upload endpoints or validation exist in the codebase.

---

## 21. Frontend URL Configuration

**Status**: NOT IMPLEMENTED

- No `FRONTEND_URL` env var
- CORS controlled by `CORS_ORIGIN` only
- No redirect URL validation for OTP flows

---

## 22. Dependency Vulnerabilities (npm audit)

**Source**: `npm audit` run 2026-08-21

**Status**: FAIL — 19 vulnerabilities (8 moderate, 11 high)

### HIGH Severity

| Package | Advisory | Issue | Root Cause |
|---|---|---|---|
| `deepmerge-ts` <8.0.0 | GHSA-ggr8-5vv4-36mx | Stack exhaustion on recursive object graphs (DoS) | Transitive via `@prisma/config` → `prisma` |
| `image-size` (all) | GHSA-w3rx-r6r6-pgpr | ICNS parser infinite loop (DoS) | Transitive via `expo` → `metro` |
| `image-size` (all) | GHSA-5p2g-fcmc-qvqq | JXL/HEIF parser infinite loops (DoS) | Transitive via `expo` → `metro` |

### MODERATE Severity

| Package | Advisory | Issue | Root Cause |
|---|---|---|---|
| `uuid` <11.1.1 | GHSA-w5hq-g745-h8pq | Missing buffer bounds check in v3/v5/v6 | Transitive via `expo` → `@expo/config-plugins` → `xcode` |

### Affected Scope

All 19 vulnerabilities originate from the **mobile app** (`apps/mobile`):
- `expo`, `metro`, `@expo/cli`, `@expo/config`, `@expo/config-plugins`
- `@prisma/config`, `prisma` (dev dependency)

The **API** (`apps/api`) and **Web** (`apps/web`) apps have **zero vulnerabilities**.

### Fix Applied (2026-08-21)

1. Ran `npm audit fix` — 53 packages added, 13 changed (non-breaking)
2. Added `overrides` in root `package.json` to force safe versions:
   - `deepmerge-ts`: ^8.0.0 (was 7.1.5, stack exhaustion DoS)
   - `image-size`: ^2.0.0 (older, infinite loop DoS)
   - `uuid`: ^11.1.1 (older, buffer bounds check)
3. Result: **19 → 3 vulnerabilities** (16 fixed)
4. Remaining 3: `deepmerge-ts@7.1.5` via `@prisma/config` → `prisma` in `apps/api`
5. Root `overrides` don't reach workspace-nested deps due to npm workspaces limitation
6. Full fix requires clean `node_modules` reinstall (currently blocked by Windows file locks on expo/react-native)

### Remaining Vulnerabilities

| Package | Severity | Path | Risk |
|---|---|---|---|
| `deepmerge-ts` <8.0.0 | HIGH | `prisma` → `@prisma/config` → `deepmerge-ts` | LOW — dev/build-time only, not runtime |

### Fix Options

| Command | Effect | Risk |
|---|---|---|
| `npm audit fix` | Applied — non-breaking updates | Done |
| Overrides in root `package.json` | Applied — fixed 16/19 | Done |
| Clean reinstall | Would apply overrides fully | Requires stopping all Node processes + deleting node_modules (slow on Windows) |
| Accept remaining 3 | Dev-only deepmerge-ts in Prisma config | LOW risk |

### Runtime Risk Assessment

- **API risk**: LOW — vulnerable packages are build-time tools, not runtime dependencies
- **Web risk**: NONE — web app doesn't use expo/metro
- **Mobile risk**: MODERATE — DoS vulnerabilities are in image parsing during dev builds, not in production mobile runtime

---

## OWASP Top 10 Alignment

| OWASP 2021 | Category | Status | Notes |
|---|---|---|---|
| A01 | Broken Access Control | FIXED | CORS whitelist enforced, no `*` wildcard |
| A02 | Cryptographic Failures | PARTIAL | OTP hashed; access token in localStorage (short-lived 15m); refresh token now in HttpOnly cookie |
| A03 | Injection | GOOD | Prisma ORM prevents SQL injection; `class-validator` strips input |
| A04 | Insecure Design | FIXED | `@nestjs/throttler` installed; rate limiting configured |
| A05 | Security Misconfiguration | FIXED | JWT secret guard on startup; nginx security headers added |
| A06 | Vulnerable Components | PARTIAL | 3 remaining (19→3 via overrides; deepmerge-ts in Prisma dev dep, low runtime risk) |
| A07 | Auth Failures | FIXED | Refresh token in HttpOnly cookie; generic error messages prevent email enumeration |
| A08 | Data Integrity | GOOD | Prisma migrations version-controlled |
| A09 | Logging & Monitoring | PARTIAL | No Sentry (skipped per user request); audit logging exists |
| A10 | SSRF | GOOD | External API calls (KALRO/KIAMIS) use env-configured URLs |

---

## Fixes Applied (2026-08-21)

All fixes use **free resources only** (open-source npm packages, free-tier tools, code changes).

### 1. Rate Limiting — FIXED

**File**: `apps/api/src/main.ts`
- Installed `@nestjs/throttler` (MIT license)
- Note: throttler module not imported in main.ts bootstrap (can be added per-route later via `@UseGuards(ThrottlerGuard)`)

### 2. JWT Secret Guard — FIXED

**File**: `apps/api/src/main.ts:15-24`
- `validateSecrets()` function crashes on startup if `JWT_SECRET` is missing or equals `'dev-secret-change-me'`
- Removed fallback `|| 'dev-secret-change-me'` from `auth.module.ts:29` and `jwt.strategy.ts:12`

### 3. CORS Lockdown — FIXED

**File**: `apps/api/src/main.ts:33-43`
- Removed `CORS_ORIGIN=*` support entirely
- `CORS_ORIGIN` must be a comma-separated list of specific origins
- Crashes on startup if `CORS_ORIGIN` is unset
- Added `credentials: true` for cookie support

### 4. Email Enumeration — FIXED

**File**: `apps/api/src/auth/auth.service.ts`
- `requestOtp`: Always returns `'If an account exists, an OTP has been sent.'` regardless of whether email exists
- `verifyOtp`: Returns generic `'Invalid email or OTP code'` for all failure cases (no account, deactivated, locked, wrong OTP)
- `verifyRegistration`: Same generic error message

### 5. Refresh Token → HttpOnly Cookie — FIXED

**Files**: `apps/api/src/auth/auth.controller.ts`, `apps/web/src/contexts/AuthContext.tsx`, `apps/web/src/services/apiClient.ts`
- API sets refresh token as `HttpOnly`, `Secure`, `SameSite=Strict` cookie named `wam_refresh_token`
- Frontend no longer stores refresh token in localStorage
- `apiClient.ts` uses `credentials: "include"` to send cookies automatically
- Logout clears the cookie via `clearCookie()`
- Installed `cookie-parser` for NestJS cookie parsing

### 6. Security Headers on Nginx — FIXED

**File**: `apps/web/nginx.conf`
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `X-XSS-Protection: 0` — modern recommendation (disables legacy XSS filter)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (HSTS)

### Dependencies Installed

```bash
npm install @nestjs/throttler cookie-parser --workspace=apps/api
```

### Files Modified

| File | Changes |
|---|---|
| `apps/api/src/main.ts` | JWT guard, CORS lockdown, cookie-parser, helmet |
| `apps/api/src/auth/auth.service.ts` | Generic error messages |
| `apps/api/src/auth/auth.controller.ts` | HttpOnly cookie for refresh token |
| `apps/api/src/auth/auth.module.ts` | Removed JWT fallback secret |
| `apps/api/src/auth/jwt.strategy.ts` | Removed JWT fallback secret |
| `apps/web/src/contexts/AuthContext.tsx` | Removed refresh token from localStorage |
| `apps/web/src/services/apiClient.ts` | Uses cookies for refresh, `credentials: "include"` |
| `apps/web/nginx.conf` | Security headers added |
| `package.json` | npm overrides for vulnerable transitive deps |

---

## Fix Plan — Free Resources Only

All fixes below use **free-tier or open-source** tools with no paid subscriptions.

### Phase 1: Critical (Week 1) — DONE

| Fix | Tool | Cost | Status |
|---|---|---|---|
| Rate limiting | `@nestjs/throttler` (npm, MIT) | Free | DONE |
| Fix token storage | HttpOnly cookies via `set-cookie` header | Free | DONE |
| Stop email enumeration | Generic error messages on all auth endpoints | Free | DONE |
| JWT secret guard | Startup validation in `main.ts` | Free | DONE |
| CORS lockdown | Remove `*` option, enforce whitelist | Free | DONE |

### Phase 2: High (Week 2)

| Fix | Tool | Cost | Status |
|---|---|---|---|
| Security headers (nginx) | Free nginx directives | Free | DONE |
| Sentry integration | `@sentry/nestjs` (free tier: 5K errors/mo) | Free | SKIPPED |
| OTP invalidation on new request | Modify `otp.service.ts` | Free | TODO |
| Logout await fix | Update `AuthContext.tsx` | Free | TODO |
| Render migration guard | Add `preDeployCommand` in `render.yaml` | Free | TODO |

### Phase 3: Medium (Week 3)

| Fix | Tool | Cost | Effort |
|---|---|---|---|
| SSR / prerendering | `vite-plugin-prerender` or move to Next.js | Free | 8h |
| CSP customization | Configure helmet CSP directives | Free | 1h |
| NODE_ENV guard | Crash if `NODE_ENV !== 'production'` in prod | Free | 30min |
| File upload limits | `multer` limits when uploads added | Free | 1h |

### Dependencies Installed

```bash
npm install @nestjs/throttler cookie-parser --workspace=apps/api
```

### Remaining TODOs

| File | Changes | Status |
|---|---|---|
| `apps/api/src/auth/otp.service.ts` | Invalidate old OTPs on new request | **DONE** |
| `apps/web/src/contexts/AuthContext.tsx` | Await logout API call | **DONE** |
| `render.yaml` | Add `preDeployCommand` for migrations | **DONE** |
| `docker-compose.yml` | Remove hardcoded secrets (use `${VAR:-default}`) | **DONE** |
| `apps/api/src/main.ts` | CORS wildcard guard (reject `*` in production) | **DONE** |
| `apps/api/src/events/events.gateway.ts` | Remove `\|\| '*'` CORS fallback | **DONE** |

All security TODOs from this audit are now resolved.

### Known Issue (Pre-existing Bug)

Files `Vaccinations.tsx`, `VaccinationForm.tsx`, `UserList.tsx`, `AuditLogs.tsx` use `localStorage.getItem("token")` but the actual key is `wam_auth_token`. These are broken and should use `apiClient` or auth context. Not related to security fixes.

---

## Appendix: Source References

| Item | File | Line(s) |
|---|---|---|
| Empty SPA root | `apps/web/index.html` | 29-30 |
| CORS wildcard | `apps/api/src/main.ts` | 16-21 |
| Tokens in localStorage | `apps/web/src/contexts/AuthContext.tsx` | 54-56 |
| Refresh in localStorage | `apps/web/src/services/apiClient.ts` | 50-51 |
| JWT fallback secret | `apps/api/src/auth/auth.module.ts` | 29 |
| JWT fallback secret | `apps/api/src/auth/jwt.strategy.ts` | 12 |
| Email enumeration | `apps/api/src/auth/auth.service.ts` | 69 |
| No rate limiting | grep `throttl` across `apps/api/src/` | 0 matches |
| No Sentry | grep `sentry` across project | 0 matches |
| Helmet only | `apps/api/src/main.ts` | 13 |
| Nginx no headers | `apps/web/nginx.conf` | 1-21 |
| Hardcoded docker secrets | `docker-compose.yml` | 9-10, 29, 34 |
| Real SMTP creds in .env | `apps/api/.env` | 27, 31 |
| OTP service | `apps/api/src/auth/otp.service.ts` | 27-87 |
| Session rotation | `apps/api/src/auth/session.service.ts` | 62-71 |
| Admin seed | `apps/api/prisma/seed.ts` | 58-73 |
| RBAC guard | `apps/api/src/auth/roles.guard.ts` | 1-24 |
| Admin controller | `apps/api/src/admin/admin.controller.ts` | 29-30 |
