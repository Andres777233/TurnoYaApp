# TurnoYa — Development Roadmap

Each phase ends with a verifiable result. A phase is done only when its acceptance criteria
pass — a rendered screen is not proof of a working module.

## Phase 0 — Environment ✅

- PHP 8.5.12, Composer 2.11, Node 24, PostgreSQL 18.6 (portable cluster), Redis-compatible
  Memurai 7.2.5.
- Laravel 13.40 + Inertia 3 + React 19 + TypeScript + Tailwind 4 starter kit installed.
- `es` locale, `America/Bogota`, PostgreSQL migrated.

## Phase 1 — Architecture ✅

- `ARCHITECTURE.md`, `PRODUCT_REQUIREMENTS.md`, `DATABASE_DESIGN.md`,
  `ROLES_AND_PERMISSIONS.md`, `BOOKING_RULES.md`, `INTEGRATIONS.md`, `ROADMAP.md`.

## Phase 2 — Foundation ✅

Delivered: domain schema (identity, businesses, memberships, professionals, catalog, media,
favorites, notification tables), capability enums + policies + tenant checks, design tokens
(cal / tinta / ceniza / bermellón), Archivo + Instrument Sans, public shell, Spanish auth
screens, account hub, landing page with real DB data.

Verified: `php artisan test` (58 tests), `tsc --noEmit`, `npm run build`, Playwright
screenshots at 390 / 768 / 1440 in both themes.

## Phase 3 — Discovery and profiles — mostly delivered

- ✅ Search with category/zone/price/rating filters, sorting, pagination.
- ✅ Business profile: cover, gallery, services, team, address, external map link.
- ✅ Professional profile: specialties, services, portfolio.
- ✅ Map panel component with real Google Maps rendering and an explicit fallback when no key.
- ⏳ Favorites UI (schema and relationship exist; no toggle/preferences screen yet).
- ⏳ Video uploads and media management screens.

## Phase 4 — Booking engine — core delivered

- ✅ Working hours, breaks, availability blocks, buffers, lead time, horizon.
- ✅ Availability endpoint, slot grid, lunch-break handling.
- ✅ Booking creation with advisory lock, revalidation and PostgreSQL exclusion constraint.
- ✅ Idempotency keys (server + client).
- ✅ Cancellation, attendance confirmation, status history.
- ✅ Customer calendar and appointment detail.
- ⏳ Business/professional panels, working-hours editor, reschedule.

## Phase 5 — Notifications

- T-30 reminder with signed confirm/cancel actions.
- In-app, email, Web Push channels; preferences.
- Vacancy alerts on cancellation, favorite + opt-in targeting, dedupe, revalidation.
- Reverb live updates.

Acceptance: time-travel tests for reminders; eligibility tests for vacancy alerts; duplicate
protection test; a user with the preference disabled never receives an alert.

## Phase 6 — Payments and tips

- `PaymentGateway` contract, `WompiGateway`, integrity signature, webhook verification.
- Payment policies per business, hold expiry, failure screens.
- Tip methods per professional with visibility control.

Acceptance: webhook signature valid/invalid/replay tests; amount mismatch rejected;
return URL cannot confirm an appointment; tip data hidden when `is_visible = false`.

## Phase 7 — Reviews and administration

- Review eligibility, duplicate protection, reporting, moderation.
- Rating recalculation, statistics, financial reports.
- Platform admin: cities, categories, business suspension.

Acceptance: ineligible review rejected; duplicate rejected; average recalculated only from
approved reviews.

## Phase 8 — Final quality

- Accessibility audit (keyboard, contrast, reduced motion).
- Responsive pass at 360–1920.
- Performance (LCP, CLS, bundle).
- Security review (authorization matrix, rate limits, signed URLs, uploads).
- End-to-end Playwright smoke run with screenshots.

## Working agreements

- No feature is "done" without tests and a real database query behind it.
- Business rules live in `app/Domain`, never in React.
- Demo data is flagged and visually labelled.
- Every missing credential is documented in `INTEGRATIONS.md`, not simulated.
