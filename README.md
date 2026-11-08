# TurnoYa

Booking marketplace for barbershops, hair salons and beauty studios in **Popayán, Cauca**.
Spanish (Colombia) UI, COP currency, `America/Bogota` timezone.

Built as a modular monolith: **Laravel 13 + Inertia 3 + React 19 + TypeScript + Tailwind 4 +
shadcn/Radix + Motion**, with **PostgreSQL 18** and **Redis**.

---

## What works today

| Area | Status |
|---|---|
| Landing page (editorial, real DB data) | ✅ |
| Discovery: search, category/zone/price/rating filters, sorting, pagination, list/map toggle | ✅ (map needs a Google key) |
| Business profile: cover, gallery, services, team, address | ✅ |
| Professional profile: specialties, services, portfolio | ✅ |
| Accounts, login, registration, 2FA, passkeys, email verification | ✅ (starter kit) |
| Capabilities model (owner / admin / professional, per-business flags) | ✅ + tests |
| Availability engine (hours, breaks, buffers, blocks, lead time, horizon) | ✅ + tests |
| Booking with advisory lock + server revalidation + PostgreSQL exclusion constraint | ✅ + tests |
| Idempotent booking (`Idempotency-Key`) | ✅ + test |
| Cancellation, attendance confirmation, appointment history | ✅ + tests |
| Customer area: my bookings, account hub, appointment detail | ✅ |
| Payments (Wompi), reminders, vacancy alerts, reviews, tips, business panel | ⏳ next phases |

**58 tests / 225 assertions passing** (`php artisan test`).

## Local setup (already provisioned on this machine)

```powershell
# PHP 8.5 + Composer are on PATH
composer install
npm install

# .env is configured for the local PostgreSQL + Redis (Memurai)
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link

npm run build
php artisan serve
```

Services are started as scheduled tasks (no admin required):

```powershell
schtasks /run /tn "TurnoYa-Postgres"
schtasks /run /tn "TurnoYa-Memurai"
```

- PostgreSQL 18 portable cluster: `C:\Users\volve\dev\pgsql18`, data `C:\Users\volve\dev\pgdata18`
- Redis-compatible Memurai 7.2.5 on `127.0.0.1:6379`
- Databases: `turnoya` and `turnoya_test` (both with `btree_gist`)

## Demo accounts (local only)

Demo records are flagged `is_demo` and labelled **Demostración** in the UI.
The seeder refuses to run when `APP_ENV=production`.

| Role | Email | Password |
|---|---|---|
| Owner / barber | `dueno.casa-barberia@turnoya.demo` | `password` |
| Owner / colorist | `dueno.salon-malva@turnoya.demo` | `password` |
| Owner / nail artist | `dueno.estudio-nube@turnoya.demo` | `password` |

## Useful commands

```powershell
php artisan test                     # full suite
php artisan migrate:fresh --seed     # reset + demo data
npm run types:check                  # tsc --noEmit
npm run build                        # Vite production build
node scripts/qa-screenshots.mjs      # Playwright screenshots -> storage/app/qa
node scripts/qa-auth.mjs             # end-to-end login + booking run
```

## Architecture

See `docs/`:

- `ARCHITECTURE.md` — modules, dependency rules, ADRs
- `PRODUCT_REQUIREMENTS.md` — personas, functional scope, copy rules
- `DATABASE_DESIGN.md` — tables, indexes, constraints, deletion strategy
- `ROLES_AND_PERMISSIONS.md` — capability matrix and enforcement layers
- `BOOKING_RULES.md` — slot algorithm, status machine, concurrency, reminders, vacancy alerts
- `INTEGRATIONS.md` — Wompi, Google Maps, S3, email, push, Reverb
- `DEVELOPMENT_ROADMAP.md` — phase status

Key modules: `app/Domain/{Identity,Scheduling,Booking,Discover}` with actions, enums and
services. Controllers are thin. Business rules are never implemented in React.

## Pending credentials

`GOOGLE_MAPS_BROWSER_KEY`, `GOOGLE_MAPS_SERVER_KEY`, `WOMPI_*`, `AWS_*`, `MAIL_*`, `VAPID_*`.
Without them the app degrades explicitly (map falls back to a zone list, payments stay off).
See `docs/INTEGRATIONS.md`.
