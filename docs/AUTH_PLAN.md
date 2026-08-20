# Authentication Implementation Plan

## Status

> **Phase 1-8 implemented and verified (2026-08-20).** Auth is fully functional across API, web, and mobile. See per-phase status below.

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Shared types + Prisma schema | ✅ Done |
| 2 | API auth module + tests | ✅ Done (21 API tests pass) |
| 2b | API admin module | ✅ Done |
| 3 | Web frontend auth (context, pages, guards, admin) | ✅ Done (web build + 151 tests pass) |
| 4 | Mobile frontend auth (context, screens, navigation) | ✅ Done (typecheck passes) |
| 5 | Route protection on existing endpoints | ✅ Done (verified e2e) |
| 6 | Demo mode (in-memory repos + seeded admin) | ✅ Done (verified e2e) |
| 7 | Docs + env | ✅ Done |

**Verified end-to-end against running API (in-memory mode):**
- `POST /api/auth/request-otp` → OTP logged/emailed
- `POST /api/auth/verify-otp` → JWT access + refresh + session issued (seeded admin `rkabue23@gmail.com`)
- `GET /api/kalro/veterinary/:id` → 200 with admin token, 401 without
- `GET /api/stats` → 401 without token
- `POST /api/auth/refresh` → rotates tokens
- `GET /api/auth/me`, `GET /api/admin/users` → admin-only, OK

**Email provider:** Brevo SMTP (`smtp-relay.brevo.com:587`) via `EMAIL_PROVIDER=smtp`; falls back to console logging in demo mode. Keys live in `apps/api/.env` (gitignored).

## Overview

Add passwordless email OTP authentication with three user roles (Admin, Field Agent, Farmer) to the Wam Mfugo monorepo. Self-registration supported; admins can also create accounts. No passwords stored — eliminates password recovery entirely.

## Auth Method: Email OTP (Passwordless)

- **No passwords stored** — users authenticate via 6-digit OTP sent to their email
- **OTP**: 6-digit numeric code, valid for 5 minutes, single use
- **JWT**: Short-lived access token (15 min) + refresh token (7 days)
- **Email delivery**: Console log in demo mode; Brevo SMTP (`smtp-relay.brevo.com:587`) in production via nodemailer
- **JWT secret**: Configured via `JWT_SECRET` env var

### Login Flow

1. User enters email on login screen
2. Server checks rate limit + lockout status
3. Server generates 6-digit OTP, stores hash + expiry (5 min)
4. Server sends OTP via email (or logs to console in demo mode)
5. User enters OTP
6. Server validates OTP, issues JWT access + refresh tokens
7. Auth event logged to audit trail
8. No passwords ever stored or transmitted

### Registration Flow

1. User fills: name, email, phone, county, role (default: Farmer)
2. Server creates account (inactive), sends verification OTP to email
3. User enters OTP to verify email
4. Account activated, JWT issued
5. Account creation logged to audit trail

---

## User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full access: manage users, all CRUD, settings, KALRO sync |
| **Field Agent** | Register animals, update health, view own registrations |
| **Farmer** | View own animals, view own profile |

---

## Security Features

### 1. OTP Rate Limiting + Account Lockout

Prevents brute force attacks on OTP verification.

**Rules:**
- Max 5 OTP requests per email per 15-minute window
- Max 10 failed OTP verification attempts per email per 15-minute window
- After 5 failed verifications: lock account for 15 minutes
- Lockout notification: "Account locked. Try again in X minutes."

**Implementation:**
- Track `otpRequestCount`, `otpRequestWindowStart` on User model (or in-memory)
- Track `failedOtpAttempts`, `lastFailedOtpAt`, `lockedUntil` on User model
- Check lockout status in `verifyOtp()` before validating OTP
- Reset failed attempts on successful verification
- Reset request count after window expires

### 2. Audit Logging

Track all authentication events for security and compliance.

**Events tracked:**
- `otp_requested` — User requested OTP (email, IP, timestamp)
- `otp_verified` — OTP verified successfully (email, IP, timestamp)
- `otp_failed` — OTP verification failed (email, IP, timestamp, reason)
- `account_locked` — Account locked due to failed attempts
- `account_unlocked` — Account unlocked after lockout period
- `login_success` — JWT issued (userId, email, role, IP, timestamp)
- `logout` — User logged out (userId, timestamp)
- `token_refreshed` — Refresh token rotated (userId, timestamp)
- `account_created` — New user registered (email, role, timestamp)
- `account_deactivated` — Admin deactivated user (targetUserId, adminId, timestamp)

**Storage:**
- `AuditLog` Prisma model (see Step 2)
- In-memory array in demo mode
- queryable via `GET /api/admin/audit-logs` (Admin only)

### 3. Session Management

Allow users to view and revoke active sessions.

**Session concept:**
- Each login creates a session (identified by refresh token hash)
- Session metadata: device type, IP, last active, createdAt
- User can see all active sessions across devices
- User can revoke specific sessions (e.g., lost device)
- Admin can revoke any user's sessions

**Implementation:**
- `Session` Prisma model (see Step 2) stores refresh token hash + metadata
- `GET /api/auth/sessions` — List user's active sessions
- `DELETE /api/auth/sessions/:id` — Revoke a specific session
- `DELETE /api/auth/sessions` — Revoke all sessions (logout everywhere)
- On logout: delete the current session record
- On refresh: old session deleted, new session created (rotation)

### 4. Email Templates (HTML OTP)

Professional branded OTP emails instead of plain text.

**Template: OTP Login Email**
- Subject: "Your Wam Mfugo Login Code"
- Body: HTML template with:
  - Wam Mfugo logo/header
  - "Your verification code is:" + large 6-digit code
  - "This code expires in 5 minutes"
  - "If you didn't request this, ignore this email"
  - Footer with app name and support email

**Template: OTP Registration Email**
- Subject: "Verify Your Wam Mfugo Account"
- Body: Similar to login but with "Welcome to Wam Mfugo" messaging

**Implementation:**
- `email-templates/otp-login.html` — HTML template with `{{code}}` and `{{expiresIn}}` placeholders
- `email-templates/otp-register.html` — HTML template for registration
- `email.service.ts` — Renders template with data, sends via provider
- Demo mode: logs the OTP code to console (no email sent)

---

## Admin Features

### 5. Admin User Management UI

Dashboard for admins to manage all user accounts.

**Web pages:**
- `/admin/users` — User list with search, filter by role/status
- `/admin/users/:id` — User detail view with edit/deactivate actions
- `/admin/audit-logs` — Audit log viewer with filters

**User list features:**
- Table with columns: Name, Email, Role, County, Status, Created, Actions
- Search by name/email
- Filter by role (Admin, Field Agent, Farmer)
- Filter by status (Active, Inactive, Locked)
- Actions: Edit role, Deactivate, Revoke sessions

**User detail features:**
- View all user info
- Change role (dropdown)
- Toggle active/inactive
- View active sessions
- Revoke all sessions
- View audit trail for this user

**API endpoints (Admin only):**
- `GET /api/admin/users` — List all users (paginated, filterable)
- `GET /api/admin/users/:id` — Get user detail
- `PATCH /api/admin/users/:id` — Update user (role, isActive)
- `DELETE /api/admin/users/:id` — Soft delete (set isActive=false)
- `POST /api/admin/users/:id/revoke-sessions` — Revoke all sessions
- `GET /api/admin/audit-logs` — List audit logs (filterable)

### 6. User Profile Management

All users can view and update their own profile.

**Profile fields editable by user:**
- Name
- Phone
- County
- Sub-county

**Fields NOT editable by user (admin only):**
- Email
- Role
- isActive

**Web page:**
- `/profile` — Profile edit form with save button

**Mobile screen:**
- `app/(tabs)/profile.tsx` — Profile edit screen

**API endpoints:**
- `GET /api/auth/me` — Get current user profile (already planned)
- `PATCH /api/auth/me` — Update own profile (name, phone, county, subCounty)

---

## Offline Auth Handling

### 7. Offline Authentication Strategy

How auth works when the device has no internet connection.

**Web:**
- Login requires online (OTP delivery needs email access)
- After login, JWT + user stored in memory (Zustand persist)
- API calls use cached token until expiry
- If token expired and offline: show "Connection required to log in" message
- Existing data accessible offline via Dexie/IndexedDB cache

**Mobile:**
- Login requires online (OTP delivery needs email access)
- After login, JWT + user stored in AsyncStorage (persistent)
- API calls use cached token until expiry
- If token expired and offline: show "Connection required to log in" message
- Existing data accessible offline via AsyncStorage cache
- Offline queue for animal registrations (synced when back online)

**Token refresh offline:**
- If refresh token exists and is not expired: attempt refresh when back online
- If refresh token expired: force re-login
- Show clear status: "Offline — using cached data" banner

**Implementation:**
- `AuthContext` stores token + user in persistent storage (web: localStorage/Zustand persist; mobile: AsyncStorage)
- `apiClient` checks token expiry before each request
- If expired: attempt refresh (needs online). If offline: show error.
- `useOnlineStatus` hook (already exists in web) controls UI banner

---

## Files to Create/Modify

### Step 1: Shared Types

**File:** `packages/shared/src/types/index.ts`

Add interfaces:

- `User`: id, email, name, phone, role (admin | field_agent | farmer), county, subCounty, isActive, createdAt, updatedAt
- `AuthPayload`: sub, email, role (for JWT decode)
- `RequestOtpRequest`: email
- `VerifyOtpRequest`: email, otp (6-digit string)
- `AuthResponse`: user, accessToken, refreshToken, session (id, device, createdAt)
- `RegisterRequest`: email, name, phone, role?, county, subCounty?
- `SessionInfo`: id, device, ip, lastActive, createdAt
- `AuditLogEntry`: id, event, email, userId, ip, metadata, timestamp
- `UpdateProfileRequest`: name?, phone?, county?, subCounty?
- `AdminUpdateUserRequest`: role?, isActive?

### Step 2: Prisma Schema

**File:** `apps/api/prisma/schema.prisma`

Add `User` model:

- id (Int, autoincrement, PK)
- email (String, unique)
- name (String)
- phone (String)
- role (String, default "farmer")
- county (String)
- subCounty (String, optional)
- isActive (Boolean, default true)
- failedOtpAttempts (Int, default 0)
- lockedUntil (DateTime, optional)
- createdAt (DateTime)
- updatedAt (DateTime)
- Maps to `users` table
- Has many: animals, sessions, auditLogs

Add `OtpCode` model:

- id (Int, autoincrement, PK)
- email (String)
- code (String) — SHA-256 hashed OTP
- expiresAt (DateTime)
- used (Boolean, default false)
- purpose (String) — "login" or "register"
- createdAt (DateTime)
- Maps to `otp_codes` table

Add `Session` model:

- id (Int, autoincrement, PK)
- userId (Int) — FK to User
- refreshTokenHash (String) — SHA-256 hashed refresh token
- device (String, optional) — User-Agent or device info
- ip (String, optional)
- lastActive (DateTime)
- expiresAt (DateTime)
- createdAt (DateTime)
- Maps to `sessions` table

Add `AuditLog` model:

- id (Int, autoincrement, PK)
- event (String) — "otp_requested", "otp_verified", "otp_failed", etc.
- email (String, optional)
- userId (Int, optional) — FK to User
- ip (String, optional)
- metadata (String, optional) — JSON string for extra data
- createdAt (DateTime)
- Maps to `audit_logs` table

Add `userId Int?` to `Animal` model with optional `User?` relation.

Run `npx prisma generate` after changes.

### Step 3: Install API Dependencies

In `apps/api`:

- `@nestjs/jwt` — JWT token signing/verification
- `@nestjs/passport` + `passport` + `passport-jwt` — JWT strategy for NestJS guards
- `crypto` — Node built-in, for OTP generation (no extra install needed)

Note: No bcrypt needed — no passwords to hash.

### Step 4: API Auth Module

**New directory:** `apps/api/src/auth/`

| File | Purpose |
|------|---------|
| `auth.module.ts` | NestJS module. Registers JwtModule, PassportModule. Provides JWT strategy, AuthService, OTP service, Session service, Audit service, Email service. |
| `auth.service.ts` | Business logic: `requestOtp()`, `verifyOtp()`, `register()`, `refreshToken()`, `logout()`, `getProfile()`, `updateProfile()`. |
| `auth.controller.ts` | Routes: `POST /api/auth/request-otp`, `POST /api/auth/verify-otp`, `POST /api/auth/register`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/me`, `GET /api/auth/sessions`, `DELETE /api/auth/sessions/:id`, `DELETE /api/auth/sessions` |
| `otp.service.ts` | OTP generation (6-digit crypto random), hashing (SHA-256), validation, rate limit checks, lockout logic |
| `session.service.ts` | Session CRUD: create, list, revoke, revokeAll, rotate on refresh |
| `audit.service.ts` | Log auth events to AuditLog table (or in-memory in demo mode) |
| `email.service.ts` | Send OTP emails. Console log in demo mode. Render HTML templates. |
| `dto/request-otp.dto.ts` | Validation: email (IsEmail) |
| `dto/verify-otp.dto.ts` | Validation: email (IsEmail), otp (IsString, Length 6, Matches /^\d{6}$/) |
| `dto/register.dto.ts` | Validation: email (IsEmail), name, phone, role (IsIn), county |
| `dto/update-profile.dto.ts` | Validation: name?, phone?, county?, subCounty? |
| `jwt.strategy.ts` | Passport JWT strategy. Extracts token from Bearer header. Validates against JWT_SECRET. |
| `jwt-auth.guard.ts` | Simple `AuthGuard('jwt')` extension. Applied to protected routes. |
| `roles.guard.ts` | Custom guard that checks `@Roles()` decorator against JWT payload role |
| `roles.decorator.ts` | `@Roles('admin', 'field_agent')` custom decorator |

**New directory:** `apps/api/src/auth/email-templates/`

| File | Purpose |
|------|---------|
| `otp-login.html` | HTML email template for login OTP. Variables: `{{code}}`, `{{expiresIn}}` |
| `otp-register.html` | HTML email template for registration verification. Variables: `{{code}}`, `{{expiresIn}}`, `{{name}}` |

### Step 5: Admin Module

**New directory:** `apps/api/src/admin/`

| File | Purpose |
|------|---------|
| `admin.module.ts` | NestJS module. Imports AuthModule (for shared services). Provides AdminService. |
| `admin.controller.ts` | Routes: `GET /api/admin/users`, `GET /api/admin/users/:id`, `PATCH /api/admin/users/:id`, `DELETE /api/admin/users/:id`, `POST /api/admin/users/:id/revoke-sessions`, `GET /api/admin/audit-logs` |
| `admin.service.ts` | Business logic: listUsers(), getUser(), updateUser(), deactivateUser(), revokeSessions(), getAuditLogs() |
| `dto/admin-update-user.dto.ts` | Validation: role? (IsIn), isActive? (IsBoolean) |
| `dto/audit-log-query.dto.ts` | Validation: event?, email?, userId?, from?, to?, page?, limit? |

### Step 6: Protect Existing Routes

**File:** `apps/api/src/app.module.ts`

- Register `AuthModule` and `AdminModule`
- Apply `JwtAuthGuard` globally or per-controller

**Route protection plan:**

| Route | Protection |
|-------|-----------|
| `GET /api/health` | Public |
| `POST /api/auth/request-otp` | Public (rate limited) |
| `POST /api/auth/verify-otp` | Public (rate limited + lockout) |
| `POST /api/auth/register` | Public |
| `POST /api/auth/refresh` | Public |
| `POST /api/auth/logout` | Authenticated |
| `GET /api/auth/me` | Authenticated |
| `PATCH /api/auth/me` | Authenticated |
| `GET /api/auth/sessions` | Authenticated |
| `DELETE /api/auth/sessions/:id` | Authenticated (own session only) |
| `DELETE /api/auth/sessions` | Authenticated |
| `GET /api/ref/*` | Public (reference data) |
| `GET /api/animals` | Authenticated |
| `POST /api/animals` | Authenticated (Field Agent, Admin) |
| `PATCH /api/animals/:id/health` | Authenticated (Field Agent, Admin) |
| `GET /api/farmers` | Authenticated |
| `GET /api/stats` | Authenticated |
| `POST /api/outbreaks` | Authenticated (Field Agent, Admin) |
| All KALRO/KIAMIS | Admin only |
| `GET /api/admin/users` | Admin only |
| `GET /api/admin/users/:id` | Admin only |
| `PATCH /api/admin/users/:id` | Admin only |
| `DELETE /api/admin/users/:id` | Admin only |
| `POST /api/admin/users/:id/revoke-sessions` | Admin only |
| `GET /api/admin/audit-logs` | Admin only |

### Step 7: Web Frontend Auth

**New files in `apps/web/src/`:**

| File | Purpose |
|------|---------|
| `contexts/AuthContext.tsx` | React context: user, token, session, requestOtp(), verifyOtp(), logout(), register(), updateProfile(), isAuthenticated, isOffline |
| `pages/Login.tsx` | Two-step form: Step 1 = email input + request OTP button; Step 2 = 6-digit OTP input + verify button. Shows lockout message if locked. |
| `pages/Register.tsx` | Form: name, email, phone, county dropdown, role selector. On submit: creates account + sends OTP. |
| `pages/Profile.tsx` | Profile edit form: name, phone, county dropdown. Save button. |
| `pages/admin/UserList.tsx` | Admin user table with search, filters, actions (edit role, deactivate) |
| `pages/admin/UserDetail.tsx` | Admin user detail with edit, sessions, audit trail |
| `pages/admin/AuditLogs.tsx` | Audit log viewer with event filter, date range, search |
| `components/ProtectedRoute.tsx` | Wrapper component: checks isAuthenticated, redirects to /login if not |
| `components/RoleRoute.tsx` | Wrapper component: checks user role, redirects if not authorized |
| `components/UserMenu.tsx` | Navbar dropdown: shows user name, role badge, profile link, logout button |
| `components/OfflineBanner.tsx` | Shows "Offline — using cached data" when disconnected |

**Modify existing files:**

| File | Change |
|------|--------|
| `App.tsx` | Wrap routes in `AuthProvider`. Add `/login`, `/register`, `/profile`, `/admin/*` routes. Wrap protected routes in `ProtectedRoute`. Wrap admin routes in `RoleRoute`. |
| `services/apiClient.ts` | Inject `Authorization: Bearer <token>` header from auth context. Handle 401 → attempt refresh → redirect to login. |
| `components/layout/Header.tsx` | Add `UserMenu` and `OfflineBanner` components |

### Step 8: Mobile Frontend Auth

**New files in `apps/mobile/`:**

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | React context: user, token, requestOtp(), verifyOtp(), logout(), register(), updateProfile() |
| `app/(auth)/_layout.tsx` | Stack navigator for auth screens (login, register) |
| `app/(auth)/login.tsx` | Two-step screen: email input → OTP input |
| `app/(auth)/register.tsx` | Registration screen |
| `app/(tabs)/profile.tsx` | Profile edit screen |

**Modify existing files:**

| File | Change |
|------|--------|
| `app/_layout.tsx` | Conditional render: if no token, show `(auth)` stack; else show `(tabs)` stack |
| `app/(tabs)/_layout.tsx` | Add profile tab and logout button in header |
| `src/api.ts` | Inject `Authorization: Bearer <token>` header. Handle 401 → attempt refresh → redirect to login. |
| `src/storage.ts` | Add token storage key (`wam_auth_token`) and user storage key (`wam_auth_user`) using AsyncStorage |

### Step 9: Demo Mode Compatibility

**File:** `apps/api/src/auth/otp.service.ts`

When `DEMO_MODE !== 'false'` and no database is configured:
- OTP is logged to the NestJS console: `[AUTH] OTP for user@example.com: 123456`
- No real email sent
- OTP validated against in-memory store
- Rate limiting still enforced in-memory

**File:** `apps/api/src/auth/in-memory-user.repository.ts`

In-memory user store for demo mode. Seeded with default admin account:
- Email: `DEFAULT_ADMIN_EMAIL` env var (default `rkabue23@gmail.com`)
- Name: Richard Karoki
- Role: admin

**File:** `apps/api/src/auth/in-memory-otp.repository.ts`

In-memory OTP store for demo mode. OTPs stored with expiry, validated in-memory.

**File:** `apps/api/src/auth/in-memory-session.repository.ts`

In-memory session store for demo mode.

**File:** `apps/api/src/auth/in-memory-audit.repository.ts`

In-memory audit log for demo mode. Logs to console as well.

---

## Implementation Order

1. **Shared types** — Add User, AuthPayload, OTP, Session, AuditLog types
2. **Prisma schema** — Add User, OtpCode, Session, AuditLog models; update Animal with userId
3. **API dependencies** — Install @nestjs/jwt, @nestjs/passport, passport-jwt
4. **API auth module** — AuthService, OTP service, Session service, Audit service, Email service, AuthController, JWT strategy, guards, DTOs
5. **API admin module** — AdminService, AdminController, DTOs
6. **API route protection** — Apply guards to existing controllers
7. **API tests** — Auth endpoint tests (request OTP, verify OTP, protected routes, admin endpoints)
8. **Web auth context + pages** — AuthContext, Login (2-step), Register, Profile, ProtectedRoute, RoleRoute
9. **Web admin pages** — UserList, UserDetail, AuditLogs
10. **Web integration** — Header user menu, OfflineBanner, apiClient token injection + refresh, route protection
11. **Mobile auth context + screens** — AuthContext, login, register, profile screens
12. **Mobile integration** — Conditional navigation, token storage, apiClient token injection
13. **Demo mode** — In-memory repositories, console OTP logging, default admin account
14. **Final verification** — All tests, typecheck, lint, browser smoke test

---

## Environment Variables

Add to `.env.example`:

```
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=5
OTP_MAX_REQUESTS=5
OTP_MAX_FAILED_ATTEMPTS=5
OTP_LOCKOUT_MINUTES=15
EMAIL_PROVIDER=console
# For production (optional):
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

---

## Security Considerations

- No passwords stored — OTP only, eliminates password recovery entirely
- OTP hashed with SHA-256 before storage (never stored in plain text)
- OTP expires after 5 minutes
- OTP is single-use (marked as used after verification)
- Rate limiting: max 5 OTP requests per 15-minute window per email
- Account lockout: after 5 failed OTP attempts, locked for 15 minutes
- Audit trail: all auth events logged with timestamp and IP
- Session management: users can view and revoke active sessions
- JWT access token expires in 15 minutes
- Refresh token rotation on each use (old session deleted, new created)
- No sensitive data in JWT payload (only sub, email, role)
- CORS restrictions in production
- Input validation on all auth DTOs
- Offline mode: clear UI indicators, cached data only, re-auth required when online
