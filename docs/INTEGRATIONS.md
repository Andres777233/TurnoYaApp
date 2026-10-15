# TurnoYa — Integrations

Every integration is behind an adapter. Missing credentials must produce a clear, honest
failure — never a fake success.

## 1. Wompi (payments, Colombia)

### 1.1 Flow (v1: Web Checkout / Widget)

```
Customer confirms booking
  → server creates appointment (pending_payment, held_until)
  → server creates payment_transactions (pending) with reference = TY-{appointment}-{nonce}
  → server computes integrity signature
      SHA256(reference + amount_in_cents + "COP" + integrity_secret)
      (expiration_time appended before the secret if used)
  → frontend opens Wompi Widget / Web Checkout with public key
  → customer pays
  → Wompi redirects to /reservas/{code}/pago/resultado?id=...   (informational only)
  → Wompi calls POST /webhooks/wompi  (source of truth)
  → server verifies checksum, then re-fetches the transaction from the Wompi API
  → server updates payment_transactions + appointment atomically
```

**The return URL is never proof of payment.** The appointment becomes `confirmed` only after a
verified webhook (or a verified server-side status query), with amount and reference matching.

### 1.2 Webhook verification

- Header `X-Event-Checksum` plus the event body's `signature` block.
- Recompute `SHA256(concat(property values in the documented order) + timestamp + events_secret)`.
- Reject on mismatch (401), on unknown reference, on amount mismatch, on currency mismatch.
- Replay: `payment_transactions.provider_id` is unique; repeated events are no-ops that return 200.
- Always re-fetch `GET https://production.wompi.co/v1/transactions/{id}` (or sandbox host)
  with the private key before changing state.
- Respond 200 quickly; heavy work goes to a queued job.

### 1.3 Statuses

| Wompi | Local |
|---|---|
| `PENDING` | `pending` |
| `APPROVED` | `approved` → appointment `confirmed` |
| `DECLINED` | `declined` → appointment `cancelled`, slot released |
| `VOIDED` | `voided` |
| `ERROR` | `error` |

### 1.4 Payment policies (per business, `businesses.settings`)

- `none` → pay at the establishment; appointment `confirmed` immediately.
- `deposit` → charge `deposit_percent` of the service price.
- `full` → charge the full price.

Supported methods depend on merchant eligibility and Wompi's current catalogue (Nequi,
Bancolombia transfer, Bancolombia QR, PSE, cards). The UI never promises a method the
merchant is not enabled for; the widget shows what Wompi offers.

### 1.5 Environment

| Variable | Purpose |
|---|---|
| `WOMPI_ENV` | `sandbox` \| `production` |
| `WOMPI_PUBLIC_KEY` | widget / checkout (public) |
| `WOMPI_PRIVATE_KEY` | server-side transaction fetch (secret) |
| `WOMPI_INTEGRITY_SECRET` | integrity signature (secret) |
| `WOMPI_EVENTS_SECRET` | webhook checksum (secret) |

### 1.6 Not implemented in v1

- Automatic payouts / splitting to professionals (requires Wompi Payouts activation and
  commercial eligibility). Documented as a future integration only.

## 2. Google Maps Platform

### 2.1 APIs used

| API | Use | Key exposure |
|---|---|---|
| Maps JavaScript API | Discovery map, business map | Browser key, restricted by HTTP referrer + API restriction |
| Places API (New) | Address autocomplete on business onboarding | Server key (proxied) |
| Geocoding API | Resolve address → coordinates | Server key |
| Routes API | Route preview: distance + duration + polyline | Server key |

### 2.2 Rules

- Two keys: `GOOGLE_MAPS_BROWSER_KEY` (restricted) and `GOOGLE_MAPS_SERVER_KEY` (never sent to
  the browser, never in Vite env).
- Route preview is rendered inside TurnoYa (polyline + duration). An "Abrir en Google Maps"
  link is offered as a fallback. No voice-guided navigation is claimed.
- Geolocation uses the browser API only after an explicit user action; denial falls back to
  the city centre.
- If the browser key is missing, the discovery page shows the list view plus a discreet dev
  notice — never a broken map container.

### 2.3 Geofence (launch: Popayán)

- `cities` table: centre, radius, `is_active`.
- On business creation/update: coordinates are required and must be inside an active city.
- Distance: bounding-box prefilter + haversine. No PostGIS at launch.

## 3. Object storage (S3-compatible)

- `FILESYSTEM_DISK=public` locally, `s3` in production; identical code path.
- Uploads validated by real MIME sniffing, max 8 MB images / 50 MB video.
- Images resized to `thumb` (400w), `card` (800w), `hero` (1600w), EXIF stripped.
- Videos: max 60 s, poster frame generated when possible.
- Paths are randomised (`media/{uuid}.jpg`); original filenames are never public.
- `portfolio_media` and `business_media` are the same `media` table with different collections.

## 4. Email

- Provider-agnostic (SMTP/API). `MAIL_MAILER=log` locally, real provider in production.
- Transactional only: verification, password reset, invitation, booking confirmation,
  reminder, cancellation, vacancy alert, review request.
- Every email has a plain-text alternative and an unsubscribe link for non-essential mail.

## 5. Web Push

- VAPID keys (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`).
- Subscription stored per user/device; invalid subscriptions are pruned on 410.
- Permission is requested only after a user action (never on page load).
- Push is a bonus channel: the in-app notification always exists.

## 6. Reverb (real-time)

- `BROADCAST_CONNECTION=reverb` in production, `log` locally.
- Channels: `private-business.{id}` (agenda), `private-user.{id}` (notifications).
- Used for live agenda updates and the notification bell. Polling fallback is acceptable.

## 7. Configuration checklist

| Variable | Required for | Status |
|---|---|---|
| `GOOGLE_MAPS_BROWSER_KEY` | Map view | ⏳ pending |
| `GOOGLE_MAPS_SERVER_KEY` | Address search, routes | ⏳ pending |
| `WOMPI_*` | Payments | ⏳ pending (sandbox) |
| `AWS_*` | Production media | ⏳ pending |
| `MAIL_*` | Email delivery | ⏳ pending |
| `VAPID_*` | Web Push | ⏳ pending |

Features degrade explicitly when a variable is absent. Nothing pretends to work.
