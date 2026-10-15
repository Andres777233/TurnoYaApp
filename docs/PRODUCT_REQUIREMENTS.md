# TurnoYa — Product Requirements

> Launch scope: **Popayán, Cauca, Colombia**. Currency **COP**. Timezone **America/Bogota**.
> UI language: **Spanish (Colombia)**. Code and docs: English.

## 1. Problem

Booking a haircut, colour, nails or makeup in Popayán currently happens over WhatsApp and
phone calls. Customers cannot compare professionals, cannot see real availability, and
businesses double-book or lose bookings in chat threads. Independent professionals have no
portfolio or reputation surface outside Instagram.

## 2. Personas

| Persona | Job to be done | Success signal |
|---|---|---|
| **Customer** (Ana, 26) | Find a trusted professional nearby and book a slot that actually exists | Books in under 90 seconds, no calls |
| **Independent owner-professional** (Camilo, 31) | Fill his agenda and show his work | More booked slots, fewer no-shows |
| **Business owner/admin** (Marcela, 42, 6 chairs) | Run the salon: team, services, agenda, money | Full visibility, no double bookings |
| **Employee/professional** (Juliana, 24) | See only her agenda and her clients | Works from her phone during the day |

## 3. Scope of v1

### 3.1 In scope

- Public landing, discovery with filters and map, business and professional profiles.
- Accounts, capabilities (customer / owner / admin / professional), invitations.
- Services, working hours, breaks, exceptions, availability.
- Booking with concurrency protection, cancellation, attendance confirmation.
- Reminders at T-30 with confirm/cancel actions.
- Vacancy alerts for favorited businesses with opt-in.
- Favorites.
- Wompi payments (sandbox first) with per-business payment policy.
- Professional tip information (no automatic payouts).
- Verified reviews of business and professional, moderation.
- Role-specific dashboards and statistics.
- Google Maps discovery and route preview.

### 3.2 Out of scope (v1)

- Native mobile apps (architecture documented separately for a later phase).
- Voice-guided turn-by-turn navigation.
- Automatic payment splitting / Wompi payouts (requires commercial activation).
- Multi-city expansion (the model supports it; the geofence does not allow it yet).
- Marketplace-wide loyalty programs, gift cards, inventory.

## 4. Functional requirements

### 4.1 Discovery (DIS)

| ID | Requirement |
|---|---|
| DIS-01 | The landing page shows a search by service, business or neighbourhood. |
| DIS-02 | Search filters: category, neighbourhood/zone, price range, minimum rating, availability window. |
| DIS-03 | Results can be sorted by relevance, rating, price and distance. |
| DIS-04 | Results can be viewed as a list or on a map; the map marker opens a preview card. |
| DIS-05 | Only published, active businesses in an active city are discoverable. |
| DIS-06 | Distance uses the customer's location when permission is granted; otherwise the city centre. |

### 4.2 Profiles (PRO)

| ID | Requirement |
|---|---|
| PRO-01 | Business profile: cover, logo, description, category, address, hours, contact, gallery, video, services, rating, professionals, reviews, map. |
| PRO-02 | Professional profile: photo, bio, specialties, services, portfolio, reviews, rating, affiliation, tip options. |
| PRO-03 | Specialties are configurable data, not a hardcoded list. |
| PRO-04 | Media is associated with exactly one business or one professional profile. |
| PRO-05 | Demo content is always visibly labelled. |

### 4.3 Booking (BOK)

| ID | Requirement |
|---|---|
| BOK-01 | Flow: business → service → professional (or "any") → date → time → review → confirm → pay if required → confirmation. |
| BOK-02 | Slots reflect business hours, professional hours, breaks, exceptions, existing appointments, duration, buffer, lead time and horizon. |
| BOK-03 | Availability is validated on the server immediately before insert. |
| BOK-04 | Overlapping appointments for the same professional are impossible at the database level. |
| BOK-05 | Booking creation is idempotent. |
| BOK-06 | Customers can cancel within the business policy window. |
| BOK-07 | A cancellation immediately frees the slot. |
| BOK-08 | Customers can confirm attendance from the reminder or the dashboard. |
| BOK-09 | Status transitions are explicit and audited. |

### 4.4 Notifications (NOT)

| ID | Requirement |
|---|---|
| NOT-01 | A reminder is sent exactly 30 minutes before the appointment. |
| NOT-02 | The reminder allows confirming attendance or cancelling. |
| NOT-03 | No automatic cancellation for non-response. |
| NOT-04 | Vacancy alerts go only to users who favorited the business and opted in. |
| NOT-05 | Vacancy alerts never reserve a slot and are revalidated on booking. |
| NOT-06 | Duplicate notifications are prevented by a unique delivery key. |
| NOT-07 | Users can disable each notification category. |
| NOT-08 | Delivery works without the browser being open (server-side queue). |

### 4.5 Payments and tips (PAY)

| ID | Requirement |
|---|---|
| PAY-01 | Each business configures: full prepayment, partial deposit, or pay at the establishment. |
| PAY-02 | Payment status is decided by a verified webhook, never by the return URL. |
| PAY-03 | Pending, approved, declined, voided and error states are handled. |
| PAY-04 | Card data never touches TurnoYa servers. |
| PAY-05 | Each professional can publish tip methods (Nequi, Daviplata, Bancolombia, Nu, other) and hide them. |
| PAY-06 | Tips are informational in v1; automatic payouts are not claimed. |

### 4.6 Reviews (REV)

| ID | Requirement |
|---|---|
| REV-01 | Only a customer with a completed appointment can review it. |
| REV-02 | One review per appointment per target (business / professional). |
| REV-03 | Reviews can be reported and moderated. |
| REV-04 | Average ratings are recalculated from approved reviews only. |
| REV-05 | No seeded or invented reviews are presented as real. |

### 4.7 Business management (BIZ)

| ID | Requirement |
|---|---|
| BIZ-01 | Owners manage business profile, media, hours, services and policies. |
| BIZ-02 | Owners invite employees; invitations can be revoked. |
| BIZ-03 | Owners can create, edit, deactivate and remove professional profiles. |
| BIZ-04 | Each professional has their own hours, services, portfolio and tips. |
| BIZ-05 | Financial reports list payments and tips records. |
| BIZ-06 | Employees see only their own agenda, their own clients' required data, their reviews and their tips. |

## 5. Non-functional requirements

| Area | Requirement |
|---|---|
| Accessibility | WCAG 2.2 AA; keyboard-complete; visible focus; reduced-motion respected |
| Performance | LCP < 2.5 s on 4G; no layout shift; images responsive and lazy except hero |
| Responsiveness | 360, 390, 768, 1024, 1440, 1920 px |
| Security | Backend authorization on every route; CSRF; rate limiting; signed action URLs |
| Privacy | Ley 1581/2012: consent, purpose, retention, export and deletion request |
| Reliability | Booking correctness under concurrency; idempotent side effects |
| Localization | All user-facing strings in es-CO; COP formatting via `Intl.NumberFormat('es-CO')` |

## 6. Copy rules

- Spanish, neutral Colombian register. No "tú" in corporate/legal text; "usted" only in legal.
- No emojis in product UI.
- No fabricated testimonials, statistics or "verified" badges.
- Money always formatted as `$ 45.000` (COP, no decimals).
- Dates as `vie, 14 nov` and times as `2:30 p. m.`.
