# Wam Mfugo — Feature Roadmap

**Last updated:** 2026-08-25
**Status:** Core platform complete, Tiers 1–6 all DONE (SMS alerts pending external API key)

---

## Current Feature Inventory

### API (`apps/api`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/request-otp` | POST | Send OTP to email |
| `/api/auth/verify-otp` | POST | Verify OTP, return JWT |
| `/api/auth/register` | POST | Register account (legacy OTP flow) |
| `/api/auth/verify-registration` | POST | Verify registration OTP (legacy flow) |
| `/api/auth/invite` | POST | Send invitation registration link to email |
| `/api/auth/verify-invite/:token` | GET | Verify invitation link, create account, return JWT |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/logout` | POST | Invalidate refresh token |
| `/api/auth/sessions` | GET | List active sessions |
| `/api/animals` | GET | List animals (paginated, filterable) |
| `/api/animals` | POST | Register new animal |
| `/api/animals/:id` | GET | Get animal details |
| `/api/animals/:id` | PATCH | Update animal |
| `/api/animals/:id` | DELETE | Delete animal (admin only) |
| `/api/animals/:id/health` | PATCH | Update health status |
| `/api/counties` | GET | List 47 Kenya counties |
| `/api/animal-types` | GET | List animal types |
| `/api/farmers` | GET | List farmers |
| `/api/vaccinations` | GET | List vaccination records |
| `/api/vaccinations` | POST | Create vaccination record |
| `/api/vaccinations/:id` | PATCH | Update vaccination record |
| `/api/vaccinations/:id` | DELETE | Delete vaccination record (admin only) |
| `/api/vaccinations/reminders` | GET | Upcoming vaccination reminders |
| `/api/vaccinations/reminders/send` | POST | Trigger reminder emails manually |
| `/api/health-alerts` | GET | List health alerts |
| `/api/sync` | POST | Offline sync endpoint |
| `/api/kalro/sync` | POST | Sync with KALRO |
| `/api/kiamis` | POST | KIAMIS registration |
| `/api/outbreaks` | GET/POST/PATCH | Outbreak reporting + status update |
| `/api/diseases/predict/risk` | POST | Disease risk prediction (county + season + history) |
| `/api/diseases/risk` | GET | List all disease risk assessments |
| `/api/diseases/risk/:county` | GET | County risk summary |
| `/api/diseases/simulate` | POST | What-if simulation (vaccination/density impact) |
| `/api/stats/vaccination-coverage` | GET | Vaccination coverage by county |
| `/api/stats/county-comparison` | GET | County-side comparison metrics |
| `/api/stats/report` | GET | Multi-section CSV report |
| `/api/health-assessment` | POST | Photo health assessment (mock AI) |
| `/api/animals/import` | POST | CSV import animals (multipart/form-data) |
| `/api/animals/bulk/health` | POST | Bulk update health status |
| `/api/animals/bulk/delete` | POST | Bulk delete animals (admin only) |
| `/api/animals/bulk/export` | POST | Bulk export selected animals as CSV |
| `/api/mortality` | GET/POST | List/report mortality records |
| `/api/mortality/stats` | GET | Mortality statistics |
| `/api/weight` | GET/POST | List/record weight measurements |
| `/api/weight/animal/:id` | GET | Weight history per animal |
| `/api/weight/stats` | GET | Weight gain statistics per animal |
| `/api/admin/users` | GET | User management |
| `/api/admin/users/:id` | GET | Get user details |
| `/api/admin/users/:id` | PATCH | Update user role/status |
| `/api/admin/users/:id` | DELETE | Deactivate user |
| `/api/admin/users/:id/permissions` | GET/PATCH | Get/set user permissions |
| `/api/admin/users/:id/sync-permissions` | POST | Sync role default permissions |
| `/api/admin/permissions/defaults` | GET | Get default permissions per role |
| `/api/admin/audit-logs` | GET | Audit log viewer |
| `/api/admin/audit-logs/export` | GET | Audit log CSV export |
| `/api/health` | GET | Health check + DB ping |
| `/api/docs` | GET | Swagger/OpenAPI docs |

### Web (`apps/web`)

| Screen | Features |
|--------|----------|
| Home | Hero, trust indicators, "How it works" steps, live stats, CTA |
| Dashboard | Overview, animals, analytics, register tabs — stats, search, filter, sort, pagination |
| Animal list | Search, filter (type/health/county), sort, pagination, edit modal, delete, KIAMIS button |
| Register | Form with camera capture, biometric hash |
| Analytics | Health distribution, type breakdown, county top-10, Recharts |
| Vaccinations | List + add/edit form, CRUD |
| Map | Leaflet map, heatmap toggle, marker clusters |
| Diseases | Disease risk prediction by county, risk assessment cards |
| Vaccination Coverage | County-level vaccination rates with progress bars |
| Mortality Tracking | Report/track animal deaths, cause analysis, stats |
| Weight Gain Analytics | Record weights, chart growth per animal, gain stats |
| County Comparison | Sortable county metrics comparison |
| What-If Simulator | Vaccination + density impact projection |
| Reminders | Vaccination reminders list |
| Farmer Dashboard | Simplified view — animals, health, upcoming vaccinations, CTA |
| Animal QR | QR code generation per animal |
| Export | CSV, PDF, KALRO JSON formats |
| Profile | Edit profile, language toggle, dark mode, sessions, notifications |
| Auth | Dev: instant login/register (DEV_AUTO_VERIFY=true). Prod: login (OTP email), register (invitation magic link). Numeric keyboard, accessible inputs. |
| Admin: Users | User list, role change, deactivate |
| Admin: Audit | Filterable audit log, translated event labels |

### Mobile (`apps/mobile`)

Organized into `components/`, `services/`, `hooks/`, `contexts/` (27 files under `src/`).

| Screen | Features |
|--------|----------|
| Home | Stats grid, health alerts, recent animals, export, live indicator |
| Animals | Search, 3-row filter (type/health/county), swipe actions, detail sheet |
| Register | Form with camera, type/county/farmer chips, dark mode-aware capture button |
| Analytics | Health/type/county bar charts, summary cards |
| Vaccinations | List + add/edit form, CRUD |
| Outbreaks | List + report form, status badges, status update |
| Map | Heatmap toggle, metric selector |
| Diseases | Disease risk prediction, county risk cards |
| Profile | Edit, dark mode, i18n, KALRO sync, admin links, sessions |
| Admin: Users | User list, role change, deactivate (real API) |
| Admin: Audit | Filterable log (real API), translated event labels |
| Auth | Dev: instant login/register (DEV_AUTO_VERIFY=true). Prod: login (OTP email), register (invitation magic link). Numeric keyboard, accessible inputs. |
| Components | Toast, Skeleton, SwipeableRow, HealthAlerts, OfflineBanner, LiveIndicator, SearchBar, AnimalDetailSheet, ErrorBoundary, DarkModeToggle, KALROSync, StaggeredItem |

### Shared (`packages/shared`)

| Module | Contents |
|--------|----------|
| Types | Livestock, Vaccination, User, HealthStatus, AnimalType |
| Constants | 47 counties, 6 animal types, breeds, diseases, farmers |
| Validators | Zod schemas for all entities |
| Utils | ID generator, seed data |

---

## Feature Roadmap

### Tier 1 — Close the Gaps (Both apps to parity)

| # | Feature | Apps | Description | Status |
|---|---------|------|-------------|--------|
| 1.1 | **Wire admin to real API** | Mobile | Connect `admin/users.tsx` and `admin/audit-logs.tsx` to real API endpoints instead of mock data | **DONE** |
| 1.2 | **Animal edit/delete** | API + Web + Mobile | Add PUT/DELETE endpoints, edit screen on mobile, edit modal on web | **DONE** |
| 1.3 | **Vaccination edit** | Web + Mobile | Add edit flow for vaccination records | **DONE** |
| 1.4 | **Outbreak reporting UI** | Web + Mobile | Create outbreak report form + list view (API exists) | **DONE** |
| 1.5 | **KIAMIS registration UI** | Web + Mobile | Add KIAMIS sync button + status display (API exists) | **DONE** |
| 1.6 | **Session management UI** | API + Web | Active session list, revoke sessions | **DONE** |
| 1.7 | **Animal photo upload** | API + Web + Mobile | Server endpoint for photo storage (client capture exists) | **DONE** |

### Tier 2 — Real-time & Offline

| # | Feature | Apps | Description | Status |
|---|---------|------|-------------|--------|
| 2.1 | **WebSocket live updates** | API + Web + Mobile | Push animal status changes, health alerts, sync events in real-time | **DONE** |
| 2.2 | **Offline queue with retry** | Mobile | Queue mutations when offline, auto-sync when back online with conflict resolution | **DONE** |
| 2.3 | **Push notifications** | API + Mobile | Expo push for critical health alerts, outbreak warnings | **DONE** |
| 2.4 | **Background sync** | Mobile | `expo-task-manager` for background data sync | **DONE** |

### Tier 3 — Analytics & Intelligence

| # | Feature | Apps | Description | Status |
|---|---------|------|-------------|--------|
| 3.1 | **Disease prediction** | API + Web + Mobile | County + season + history → risk level, 6 diseases, real-time prediction | **DONE** |
| 3.2 | **Vaccination coverage map** | API + Web + Mobile | County-level vaccination % with progress bars | **DONE** |
| 3.3 | **Mortality tracking** | API + Web + Mobile | Report/track animal deaths, causes, county stats | **DONE** |
| 3.4 | **Weight gain analytics** | API + Web + Mobile | Record weights, chart growth per animal, gain stats | **DONE** |
| 3.5 | **County comparison** | API + Web | Side-by-side county metrics, sortable | **DONE** |
| 3.6 | **Export reports** | API + Web | Comprehensive multi-section CSV report | **DONE** |
| 3.7 | **What-if simulator** | API + Web | Project vaccination + density impact on disease risk | **DONE** |

### Tier 4 — Farmer Experience

| # | Feature | Apps | Description | Status |
|---|---------|------|-------------|--------|
| 4.1 | **SMS alerts** | API | Africa's Talking SMS for health alerts to non-smartphone farmers | Pending |
| 4.2 | **Farmer dashboard** | Web | Simplified view — their animals, health, upcoming vaccinations, empty state CTA | **DONE** |
| 4.3 | **Multi-language voice input** | Web | Swahili/English speech-to-text via Web Speech API | **DONE** |
| 4.4 | **Photo-based health assessment** | API + Web | Upload photo → mock AI → health status + findings + recommendations | **DONE** |
| 4.5 | **QR code per animal** | Web | Generate QR code linking to animal profile | **DONE** |
| 4.6 | **Vaccination reminders** | API + Web + Mobile | Schedule reminders for upcoming vaccination due dates | **DONE** |

### Tier 5 — Admin & Compliance

| # | Feature | Apps | Description | Status |
|---|---------|------|-------------|--------|
| 5.1 | **Granular RBAC** | API | Permissions: can_register, can_vaccinate, can_export, can_admin, can_view_reports, can_manage_users, can_manage_outbreaks | **DONE** |
| 5.2 | **Audit log improvements** | API | Track IP, user agent, before/after values | **DONE** |
| 5.3 | **Data retention policy** | API | Auto-archive old records, GDPR deletion | Pending |
| 5.4 | **Bulk operations** | API + Web | Select multiple animals → bulk vaccinate/export/update | **DONE** |
| 5.5 | **CSV import** | API + Web | Upload CSV → validate → bulk import | **DONE** |
| 5.6 | **KALRO report builder** | Web | Custom report with date range, county, type filters + CSV export | **DONE** |

### Tier 6 — Infrastructure

| # | Feature | Apps | Description | Status |
|---|---------|------|-------------|--------|
| 6.1 | **Rate limiting** | API | 3-tier throttler (1s/3, 10s/20, 60s/100) via @nestjs/throttler | **DONE** |
| 6.2 | **API versioning** | API | Swagger version 1.0.0, /api prefix | **DONE** |
| 6.3 | **Structured logging** | API | Winston JSON transport, log levels, exception filter | **DONE** |
| 6.4 | **CI/CD pipeline** | Repo | GitHub Actions — lint, typecheck, test, build | **DONE** |
| 6.5 | **E2E tests** | All | Jest+Supertest (API, 21 tests), Vitest (web, 144 tests) | **DONE** |

### Tier 7 — UI/UX Polish (NEW)

| # | Feature | Apps | Description | Status |
|---|---------|------|-------------|--------|
| 7.1 | **Mobile i18n** | Mobile | All screens migrated to `useI18n()` hook with flat key structure, ~200 keys | **DONE** |
| 7.2 | **Mobile dark mode** | Mobile | All hardcoded hex colors replaced with `useColors()` theme tokens | **DONE** |
| 7.3 | **Mobile touch targets** | Mobile | All interactive elements >= 44px (reportBtn, filterChip, statusBtn, etc.) | **DONE** |
| 7.4 | **Web i18n** | Web | 17 pages fixed: `t("text","text")` → proper JSON keys in en/sw translation files | **DONE** |
| 7.5 | **Web styling** | Web | FarmerDashboard CSS vars → Tailwind tokens, error handling + retry | **DONE** |
| 7.6 | **Translation cleanup** | Web | Swahili duplicate key removed, AI slop removed from copy | **DONE** |
| 7.7 | **OTP accessibility** | Web | `inputMode="numeric"` + `pattern="[0-9]*"` on Login/Register OTP inputs | **DONE** |
| 7.8 | **Empty states** | Web | FarmerDashboard "Register first animal" CTA, error retry button | **DONE** |

---

## Gap Analysis: Web vs Mobile

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Animal edit/delete | **DONE** | **DONE** | Closed |
| Vaccination edit | **DONE** | **DONE** | Closed |
| Outbreak reporting UI | **DONE** | **DONE** | Closed |
| KIAMIS registration UI | **DONE** | **DONE** | Closed |
| Admin (users/audit) | Real API | **Real API** | Closed |
| Photo upload | Client + server | Client + server | Closed |
| Session management | **DONE** | **DONE** | Closed |
| WebSocket | **DONE** | **DONE** | Closed |
| Disease prediction | **DONE** | **DONE** | Closed |
| Weight tracking | **DONE** | **DONE** | Closed |
| County comparison | **DONE** | — | Web only (analytical tool) |
| What-if simulator | **DONE** | — | Web only (admin/planning tool) |
| Vaccination reminders | **DONE** | API ready | Cron job + API endpoint |
| Farmer dashboard | **DONE** | — | Web only (simplified view) |
| QR codes | **DONE** | — | Web only (print/download) |
| Voice input | **DONE** | — | Web only (Web Speech API, free) |
| Photo health assessment | **DONE** | — | Mock AI (swap Azure Computer Vision for prod) |
| Offline queue | — | **DONE** | Mobile only (field use) |
| Push notifications | Browser only | **Full Expo push** | Closed |
| Export formats | CSV + PDF + KALRO | CSV only | Mobile needs PDF + KALRO |
| Bulk operations | **DONE** | **DONE** | Closed |
| CSV import | **DONE** | **DONE** | Closed |
| i18n | **DONE** (nested keys) | **DONE** (flat keys) | Closed — different key structures |
| Dark mode | **DONE** (CSS vars) | **DONE** (useColors hook) | Closed — different implementation |
| Touch targets | **DONE** (>= 44px) | **DONE** (>= 44px) | Closed |
| Error handling | **DONE** (generic) | **DONE** (generic) | Closed |

## Test Counts

| App | Framework | Tests | Files |
|-----|-----------|-------|-------|
| Web | Vitest | 144 | 17 |
| API | Jest | 21 | 4 |
| Mobile | tsc --noEmit | Typecheck only | — |
