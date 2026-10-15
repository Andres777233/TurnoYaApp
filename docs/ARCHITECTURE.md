# TurnoYa — Architecture

> Status: living document. Last updated for Phase 2.
> Scope of this document: how the system is structured, why, and which rules must not be broken.

## 1. System context

TurnoYa is a multi-tenant booking marketplace for beauty and personal-care businesses in
Popayán, Cauca (Colombia). A single Laravel application serves:

- Public discovery (landing, search, business and professional profiles).
- Customer accounts (favorites, bookings, reviews, tips).
- Business workspaces (team, services, schedules, appointments, finances).
- Integrations (Wompi payments, Google Maps, S3 media, email, Web Push, Reverb).

```
Browser (React + Inertia)
        │  HTML / JSON (Inertia protocol)
        ▼
Laravel 13 (modular monolith)
  ├── HTTP / Inertia controllers
  ├── Domain actions (business rules)
  ├── Policies / Gates (authorization)
  ├── Queues (Redis) + Scheduler
  ├── Broadcasting (Reverb)
  └── Notifications (mail, database, push)
        │
        ├── PostgreSQL 18  (source of truth)
        ├── Redis          (cache, session, queues)
        ├── S3-compatible  (media)
        ├── Wompi          (payments)
        └── Google Maps    (places, routes, geocoding)
```

## 2. Architectural style

**Modular monolith.** One deployable unit, one database, clear internal boundaries. No
microservices, no Kubernetes, no event bus. The goal is that a module can be extracted later
without a rewrite, not that it is extracted now.

### 2.1 Dependency rule

```
Http  ──►  Domain  ──►  Models (Eloquent)
  │           │
  └───────────┴──►  Support (money, time, geo)
```

- `app/Http` may depend on `app/Domain`.
- `app/Domain/{Module}` must **not** import from `app/Http` or from another module's
  `Http` namespace.
- Cross-module collaboration happens through the *public* action classes of the other module,
  never by reaching into its internals.
- Eloquent models live in `app/Models` (framework convention) but are treated as part of the
  domain. Query logic belongs in query objects / scopes, not in controllers.

### 2.2 Folder structure

```
app/
├── Domain/
│   ├── Identity/        # users, capabilities, membership
│   ├── Business/        # businesses, professionals, services, media
│   ├── Discover/        # search, filters, geofence
│   ├── Scheduling/      # working hours, breaks, availability calculation
│   ├── Booking/         # appointment lifecycle, state machine, concurrency
│   ├── Payments/        # gateway contract, Wompi, webhooks, tips
│   ├── Notifications/   # reminders, vacancy alerts, preferences, dedupe
│   └── Reviews/         # eligibility, moderation, aggregates
├── Http/
│   ├── Controllers/{Public,Panel,Settings}
│   ├── Requests/
│   └── Middleware/
├── Models/
└── Support/             # Money, TimeRange, Geo, Slug
```

Each domain module contains: `Actions/`, `Data/` (DTOs), `Enums/`, `Queries/`, `Events/`.

## 3. Key decisions (ADR log)

| # | Decision | Rationale | Consequence |
|---|---|---|---|
| 1 | Inertia 3 + React 19 instead of a separate SPA/API | One repo, server-side authorization on every page, no token plumbing | No public JSON API in v1; routes return Inertia responses |
| 2 | Capabilities, not one global role | A user can be customer + owner + professional at once | Authorization always derives from `business_memberships` + platform flag |
| 3 | Integer cents for money | COP has no decimals in practice; Wompi requires cents | `*_cents` columns, `Money` value object, never floats |
| 4 | UTC storage, business-level timezone | Future cities may differ; Colombia has no DST now | All timestamps `timestamptz`; render in `businesses.timezone` |
| 5 | Availability computed server-side only | A client can lie; double booking is unacceptable | `AvailabilityService` is the single source of truth; UI never invents slots |
| 6 | Three layers of double-booking protection | Correctness over convenience | advisory lock + revalidation + PostgreSQL exclusion constraint |
| 7 | Slots are held during payment | Redirect-based payments take time | `pending_payment` appointments block the range until `held_until` |
| 8 | Idempotency keys on booking and payment | Retries and double-clicks are normal | `idempotency_keys` table with unique index |
| 9 | Payment status decided by webhook + server fetch | Client redirects are not proof | `PaymentGateway` contract, signature verification, replay protection |
| 10 | No PostGIS at launch | One city, simple radius check | `cities` table with center + radius; haversine in SQL/PHP |
| 11 | Media on S3-compatible storage, local disk in dev | Same code path via Laravel Filesystem | `FILESYSTEM_DISK` switch, no provider-specific code |
| 12 | Demo data is flagged in the database | Never present demo content as real | `is_demo` columns + visible badge + production guard in seeders |

## 4. Request lifecycle (a booking)

1. `POST /reservas` hits `StoreAppointmentRequest` (validation + `Idempotency-Key`).
2. `CreateAppointment` action opens a transaction.
3. `pg_advisory_xact_lock(hash(professional_id, date))` serializes competing requests.
4. `AvailabilityService::assertSlotIsBookable()` re-validates against the DB.
5. Insert appointment; the exclusion constraint is the final guard.
6. If payment is required → status `pending_payment`, `held_until = now + hold minutes`.
7. Commit. Dispatch `AppointmentCreated` (queued listeners: notification, calendar broadcast).
8. Response includes the payment intent (redirect or widget payload) or the confirmation.

## 5. Multi-tenancy and scoping

Tenancy is **row-level** and enforced in three places:

1. Route model binding scoped by membership (`/panel/{business}/...`).
2. A `BelongsToBusiness` trait / global scope on business-owned models.
3. Policies that receive the acting user and the target business.

A professional can only see their own appointments and the customer data required to serve
them. Owners/admins can see the whole business. Platform admins are a separate flag
(`users.is_platform_admin`) and never implicitly get business data through a business route.

## 6. Background processing

- **Redis** for queues, cache and sessions.
- **Scheduler** (every minute): reminders at T-30, expire payment holds, close past
  appointments, dispatch vacancy alerts.
- Every job is idempotent and uses `WithoutOverlapping` where relevant.
- Failed jobs are retried with backoff and recorded; nothing is silently swallowed.

## 7. Observability

- Structured logs with `business_id`, `user_id`, `appointment_id` context where applicable.
- `audit_logs` for sensitive operations (role changes, payment status, refunds, moderation).
- Laravel Pulse/Telescope are optional in local; not required at launch.
- Health endpoint: `/up`.

## 8. Deployment topology (target)

Single application server + managed PostgreSQL + managed Redis + S3 bucket + queue worker +
scheduler. Horizontal scaling is possible later because sessions and queues already live in
Redis and the app is stateless apart from local media (which is on S3).

## 9. What this architecture deliberately avoids

- No microservices, service mesh, or event sourcing.
- No client-side availability calculation.
- No generic "roles" enum on `users`.
- No fake integrations: if a credential is missing, the feature fails closed with a clear
  message, and the limitation is documented.
