# TurnoYa — Roles and Permissions

## 1. Model

There is **no single global role** on `users`. Capabilities are derived from:

1. **Platform flags**: `is_platform_admin` (TurnoYa staff, no implicit business access).
2. **Memberships**: `business_memberships` (role + flags + status) per business.
3. **Ownership of records**: a customer owns their appointments, reviews, favorites.

A user can be, simultaneously: a customer, the owner of one business, an employee at
another, and a professional who performs services at both. Every screen and every endpoint
resolves capabilities, never `user.role`.

```php
$user->canFor($business, Capability::ManageTeam);
```

### 1.1 Membership roles

| Role | Meaning |
|---|---|
| `owner` | Created the business. Implicitly all capabilities. Cannot be removed by admins. |
| `admin` | Manager with delegated capabilities. |
| `professional` | Performs services. Personal agenda only by default. |

### 1.2 Capability flags (stored per membership)

| Flag | Grants |
|---|---|
| `can_manage_business` | Profile, media, hours, services, policies |
| `can_manage_team` | Invite/revoke employees, edit professional profiles |
| `can_view_finances` | Payments, tips records, financial reports |
| `performs_services` | Has a linked `professional_profile` and a personal agenda |

Owner → all four true. Admin → configurable. Professional → `performs_services` only,
unless explicitly delegated.

## 2. Capability matrix

Legend: ✅ allowed · 👁 read-only · ⛔ denied · 🔒 own records only

| Action | Customer | Professional | Admin | Owner | Platform admin |
|---|---|---|---|---|---|
| Browse/search profiles | ✅ | ✅ | ✅ | ✅ | ✅ |
| Favorite a business | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book an appointment | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cancel own appointment | 🔒 | 🔒 | 🔒 | 🔒 | ✅ |
| Confirm attendance | 🔒 | 🔒 | 🔒 | 🔒 | ✅ |
| Review a completed appointment | 🔒 | 🔒 | 🔒 | 🔒 | ✅ |
| View business dashboard | ⛔ | ✅ | ✅ | ✅ | 👁 |
| View own agenda | — | 🔒 | 🔒 | 🔒 | 👁 |
| View all business appointments | ⛔ | ⛔ | ✅ | ✅ | 👁 |
| View customer contact data | ⛔ | 🔒 assigned only | ✅ | ✅ | ⛔ |
| Create/edit services | ⛔ | ⛔ | ✅* | ✅ | ⛔ |
| Set own working hours | ⛔ | 🔒 | ✅* | ✅ | ⛔ |
| Manage business profile/media | ⛔ | ⛔ | ✅* | ✅ | ⛔ |
| Invite/revoke employees | ⛔ | ⛔ | ✅* | ✅ | ⛔ |
| Create professional profiles | ⛔ | ⛔ | ✅* | ✅ | ⛔ |
| View finances | ⛔ | ⛔ | ✅* | ✅ | ⛔ |
| Moderate reviews | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |
| Change membership roles | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |
| Publish/unpublish business | ⛔ | ⛔ | ⛔ | ✅ | ✅ |

`*` requires the corresponding capability flag.

## 3. Enforcement layers

1. **Route**: `auth` + `verified` + `EnsureBusinessMember` (resolves `{business}` from the
   route and aborts 403 if no active membership).
2. **Policy**: every model has a policy; policies receive the membership when relevant.
3. **Query scoping**: `BelongsToBusiness` global scope prevents accidental cross-tenant reads
   even if a controller forgets a `where`.
4. **UI**: buttons are hidden for clarity, never as security.

## 4. Employee isolation (hard rules)

- A professional cannot list another professional's appointments, customers or reviews.
- The customer relationship is only visible through appointments assigned to that
  professional. Fields exposed: name, phone, notes relevant to the service, history with
  **that** professional.
- Business-wide aggregates (revenue, occupancy) are not shown to employees.
- Direct object access (`/panel/appointments/{id}`) is denied unless the appointment belongs
  to the acting professional or the user has business-wide access.

## 5. Invitations

1. Owner/admin creates an invitation with `email` + `role` + flags.
2. A hashed token is stored; the plain token goes only in the email link.
3. The invitee accepts: if the email already exists, the membership is attached to that user;
   otherwise an account is created (password set by the invitee).
4. Tokens expire in 7 days, are single-use, and can be revoked.
5. Accepting an invitation never grants capabilities beyond those stored on the membership.

## 6. Platform administration

`is_platform_admin` is intentionally narrow: review moderation, city/category management,
business suspension. Platform admins do **not** get appointment or customer data through
business routes; any such access requires a separate, audited support process (future).

## 7. Tests required

- Every cell of the matrix that is ⛔ has a feature test asserting 403.
- Every 🔒 case has a test proving the record of another professional is invisible.
- Ownership transfer and self-revocation are impossible.
- A revoked membership loses access immediately (no cached capabilities).
