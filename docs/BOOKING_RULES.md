# TurnoYa — Booking Rules

This is the contract of the booking engine. Any change here requires tests.

## 1. Definitions

| Term | Meaning |
|---|---|
| **Slot** | A potential appointment start, on the business's slot grid |
| **Grid** | `settings.slot_interval_minutes` (default 15) |
| **Lead time** | `settings.min_lead_minutes` (default 60) — no bookings closer than this |
| **Horizon** | `settings.max_horizon_days` (default 60) |
| **Buffer** | `services.buffer_minutes` — cleaning/prep after the service |
| **Blocked range** | `[starts_at, ends_at + buffer)` — what the professional cannot reuse |
| **Hold** | A `pending_payment` appointment that blocks the range until `held_until` |

## 2. Slot calculation

Input: business, service, professional (or "any"), local date, current instant.

```
1. Resolve professional working hours for that weekday, clipped to the business hours.
   Effective = business_hours ∩ professional_hours
2. Subtract breaks that belong to the effective working hours.
3. Subtract availability_blocks (holidays, personal time, temporary unavailability).
4. Subtract active appointments whose blocked range overlaps the day
   (pending_payment, confirmed, attendance_confirmed, completed) of that professional.
   - Expired holds (held_until < now) are cancelled first, inside the transaction.
5. For each candidate start on the grid between (now + lead_time) and
   (now + horizon):
     a. start + service_duration must fit inside an effective working window;
     b. [start, start + duration + buffer) must not intersect breaks, blocks or bookings;
     c. if professional = "any", the slot is available when at least one eligible
        professional is free; the assignment is chosen at confirmation time.
6. Return local times, with the resolved professional id when unique.
```

Rules:
- The service duration used is the professional override when set, otherwise the service value.
- A slot is never returned if the professional is not assigned to the service.
- The grid is aligned to the business day start, not to the hour.
- The API returns only `available: true` slots. Reasons for unavailability are not leaked.
- The server never trusts a duration, price or professional sent by the client: it reloads
  the service and the professional-service link.

## 3. Creation

```
BEGIN;
  pg_advisory_xact_lock(hashtext(professional_id || ':' || local_date));
  cancelExpiredHoldsForRange(professional_id, range);
  assertSlotIsBookable(...);            // authoritative re-check
  INSERT appointment (...);             // exclusion constraint is the last guard
  INSERT status history (created);
COMMIT;
```

Then, outside the transaction:
- dispatch `AppointmentCreated` → notifications, calendar broadcast;
- if `payment_policy = none` → `confirmed`;
- if `deposit|full` → `pending_payment` with `held_until = now + hold_minutes`.

### Idempotency

`POST /reservas` requires an `Idempotency-Key` header. The key is stored with the request hash.
- Same key + same hash → return the stored response (no second appointment).
- Same key + different hash → 409.
- Keys expire after 24 h.

### Failure codes

| Situation | HTTP | Message (es-CO) |
|---|---|---|
| Slot taken meanwhile | 409 | "Ese horario acaba de ocuparse. Elige otro." |
| Outside working hours | 422 | "El profesional no atiende en ese horario." |
| Too close to now | 422 | "Necesitamos al menos 60 minutos de anticipación." |
| Service not offered by professional | 422 | "Ese servicio no está disponible con este profesional." |
| Payment required but gateway down | 503 | "No pudimos iniciar el pago. Intenta de nuevo." |

## 4. Status machine

```
                 ┌──────────────┐
   created ─────►│pending_payment│──(payment approved)──► confirmed
                 └──────┬───────┘
                        │ hold expires / payment declined
                        ▼
                    cancelled

   confirmed ──(T-30 confirm)──► attendance_confirmed ──(service given)──► completed
       │                                   │
       │ cancel                            │ no-show
       ▼                                   ▼
   cancelled                            no_show
```

Valid transitions:

| From | To | Actor | Notes |
|---|---|---|---|
| — | `pending_payment` | system | when payment is required |
| — | `confirmed` | system | when no payment is required |
| `pending_payment` | `confirmed` | system (webhook) | amount must match |
| `pending_payment` | `cancelled` | system | hold expired, declined, or error |
| `confirmed` | `attendance_confirmed` | customer, staff | idempotent |
| `confirmed` | `cancelled` | customer (within policy), staff | policy decides refund |
| `confirmed` | `no_show` | staff | after the start time |
| `attendance_confirmed` | `completed` | staff/system | after `ends_at` |
| `attendance_confirmed` | `cancelled` | staff only | exceptional |
| `completed` | — | terminal | enables reviews |
| `cancelled` | — | terminal | frees the slot immediately |
| `no_show` | — | terminal | |

Every transition writes `appointment_status_history` with actor and reason.

## 5. Cancellation policy

- `settings.cancellation_window_hours` (default 24).
- Customer cancels outside the window → free cancellation, status `cancelled`.
- Inside the window → still cancellable, but recorded as late; the business may apply
  `late_cancellation_fee_percent` to a captured deposit (manual review in v1 unless the
  payment provider supports partial refunds and the business enabled it).
- Staff cancellation always allowed, with a reason.
- Cancellation never deletes the row and **immediately** triggers slot reavailability and
  vacancy alerts.

## 6. Reminders

- A scheduler command runs every minute.
- Selects `confirmed` appointments with `starts_at BETWEEN now+29min AND now+31min`
  and `reminder_sent_at IS NULL`.
- Claims each row atomically (`UPDATE ... SET reminder_sent_at = now() WHERE id = ? AND
  reminder_sent_at IS NULL`), then enqueues the notification.
- Channels: in-app, email, Web Push (if subscribed).
- Payload: business, service, professional, local time, address, two signed actions:
  `Confirmar asistencia` and `Cancelar`.
- Links are signed, expiring, and bound to the appointment; they work without a login and
  are idempotent.
- **No automatic cancellation** for non-response.

## 7. Vacancy alerts

Triggered when an appointment moves to `cancelled` (or a block/hold is released) and a slot
becomes bookable again.

```
1. Recompute the actual available slots for that professional and day.
2. For each released slot, find eligible recipients:
     users with favorite(business, notify_on_vacancy = true)
     AND notification_preferences.vacancy_alerts_enabled
     AND no overlapping active appointment of their own
     AND not the user who cancelled
3. Persist a delivery row with dedupe_key
     vacancy:{user}:{business}:{professional}:{slot_start}:{service}
   The unique index makes duplicate sends impossible.
4. Queue the notification. Payload includes business, date, time and a booking link.
5. The slot is NEVER reserved. On click, availability is revalidated; the first successful
   booking transaction wins.
```

Additional rules:
- No alert if the slot was already rebooked before dispatch (revalidate in the job).
- Batching: at most one alert per user+business+day per dispatch window.
- Quiet hours apply to push only; the in-app record is always created.

## 8. Edge cases covered by tests

- Two customers submit the same slot simultaneously → exactly one appointment.
- Retry with the same idempotency key → one appointment, same response.
- Payment hold expires while the customer is on Wompi → slot is released and the redirect
  lands on a clear "expired" screen.
- DST-free timezone (America/Bogota) but the code must still convert correctly for a future
  city with DST.
- Buffer overlaps: a 45-min service with 15-min buffer blocks 60 minutes.
- A break in the middle of a service → the slot is not offered.
- Holiday exception → no slots.
- "Any professional" with one busy professional → slot offered for the free one.
