# Backend architecture — design notes (Phase 6)

This document captures the proposed move from the current `localStorage`-only demo to a real backend. It is a planning artefact only — no production code in this repo depends on it, and no migration is in progress.

## Current state (frontend-only)

- Angular 11 single-page application.
- All persistence is `localStorage`. Keys include `bookings`, `fleetVehicles`, `vehicleCatalogue` (and a number of legacy aliases re-mirrored by `restoreDemoCommerceData` / `repairDemoVehicleCatalogueData`), `rentalLocations`, `customers`, `discountCodes`, `rewards`, `paymentTransactions`, and per-domain activity logs.
- Lifecycle is coordinated client-side, primarily by:
  - `BookingFleetLifecycleService` — book / cancel / complete a booking and flip the matching fleet unit between `available`/`booked`.
  - `FleetAvailabilityService` — answers "what's available at location X on date Y?" against the local fleet store.
  - `RentalService` — caches bookings in memory; exposes `reloadFromStorage()` so writes from the lifecycle service can be re-read into the cache.
- Auth is a demo-only check; "admin" credentials are baked in as `admin` / `admin123`.

Key consequence: every browser holds its own demo state. There is no shared state between users, devices, or sessions, and no audit trail outside the per-browser activity logs.

## Goals of a backend split

1. **Shared persistence.** Multiple users should see the same fleet, the same booking and the same availability.
2. **Real auth.** Customer accounts, admin accounts, and Devin-style service accounts should be separately authenticated.
3. **Authoritative availability.** "Is unit #42 free for these dates?" must be answered by the server, not by whichever client happens to have stale localStorage.
4. **Lifecycle integrity.** Cancellation, completion, refund, and fleet-unit release must be atomic.
5. **Auditability.** Every state transition is recorded with actor, timestamp, before/after.
6. **Incremental migration.** Existing Angular components should keep working with minimal rewrites — the goal is to replace the data access layer, not the UI.

Non-goals for the first cut: real payment processing, real notifications, real telematics. The mock checkout and mock payment flows remain mocks; they just call the backend instead of localStorage.

## Proposed stack

| Layer | Choice | Why |
|---|---|---|
| Database | PostgreSQL 15+ | Strong relational guarantees, easy to model bookings/fleet/customers; native JSONB for the `extras`/`activityPayload` fields that today are arbitrary objects. |
| ORM | Prisma | First-class TypeScript, migrations as code, single source of truth for schema, plays well with NestJS. (TypeORM is the alternative; Prisma's developer ergonomics win for a greenfield service.) |
| API framework | NestJS | Module/provider model maps cleanly onto the existing Angular services (`BookingService`, `FleetService`, etc). Built-in validation (class-validator), DI, guards, interceptors. Shared DTOs / types with the Angular app via a `packages/shared-types` workspace. |
| API style | REST + OpenAPI | The existing Angular services already expect Promises/Observables of `{ data, message, success }`. Generating the OpenAPI spec from NestJS controllers lets us regenerate a typed Angular client. GraphQL is overkill for this product. |
| Auth | JWT access tokens + refresh tokens, server-side issued | Replaces the current "demo admin password" with proper hashed credentials. Customer and admin are separate roles on the same `users` table. |
| Hosting | Container per service (NestJS API, PostgreSQL, optional Redis), behind a single reverse proxy | Aligns with how the demo would be deployed (e.g. Fly.io, Render, ECS). |
| CI/CD | Same GitHub Actions repo; new jobs for the API module (lint, test, prisma migrate diff, build). | Keeps everything in one place at this scale. |

## Proposed schema (first cut)

Minimal set to make the existing flows server-authoritative. Names match the Angular models where possible.

```text
users
  id                 uuid pk
  email              text unique
  password_hash      text
  full_name          text
  phone              text
  role               enum('customer','admin')   default 'customer'
  reward_points      integer                    default 0
  is_disabled        boolean                    default false
  created_at         timestamptz
  updated_at         timestamptz

rental_locations
  id                 serial pk
  name               text
  city               text
  branch_code        text
  is_active          boolean
  created_at         timestamptz

vehicle_catalogue
  id                 serial pk
  make               text
  model_name         text
  display_name       text
  model_year         integer
  daily_price        numeric(10,2)
  description        text
  image_path         text
  category           text
  transmission       text
  fuel_type          text
  seats              integer
  -- specs that today are looked up in `getVehicleSpecsFor()` move to columns or jsonb
  specs              jsonb
  created_at         timestamptz
  updated_at         timestamptz

fleet_vehicles
  id                 serial pk
  catalogue_item_id  integer fk -> vehicle_catalogue.id
  registration_number text unique
  colour             text
  mileage            integer
  location_id        integer fk -> rental_locations.id
  status             enum('available','booked','maintenance','inactive')
  service_status     text
  next_service_due   date
  is_active          boolean
  created_at         timestamptz
  updated_at         timestamptz

bookings
  id                 serial pk
  booking_reference  text unique               -- CR-XXXX
  customer_id        uuid fk -> users.id (nullable for walk-ins)
  fleet_vehicle_id   integer fk -> fleet_vehicles.id (nullable until assigned)
  catalogue_item_id  integer fk -> vehicle_catalogue.id
  pickup_location_id integer fk -> rental_locations.id
  return_location_id integer fk -> rental_locations.id
  rent_date          date
  return_date        date
  rental_days        integer
  daily_rate         numeric(10,2)
  extras_total       numeric(10,2)
  discount_total     numeric(10,2)
  rewards_total      numeric(10,2)
  total_price        numeric(10,2)
  status             enum('Pending','Confirmed','Active','Completed','Cancelled')
  payment_status     enum('Pending','Paid','Refunded','Failed')
  payment_method     text
  payment_reference  text
  paid_at            timestamptz
  cancelled_at       timestamptz
  selected_extras    jsonb         -- preserves today's free-form extras shape
  metadata           jsonb         -- catch-all for future UI fields
  created_at         timestamptz
  updated_at         timestamptz

payments
  id                 serial pk
  booking_id         integer fk -> bookings.id
  method             text
  amount             numeric(10,2)
  status             enum('Paid','Refunded','Failed','Pending')
  transaction_reference text
  occurred_at        timestamptz

discount_codes
  id                 serial pk
  code               text unique
  type               enum('percent','fixed')
  value              numeric(10,2)
  expires_at         timestamptz
  min_spend          numeric(10,2)
  max_uses           integer
  uses_count         integer        default 0
  is_active          boolean

rewards_transactions
  id                 serial pk
  customer_id        uuid fk -> users.id
  booking_id         integer fk -> bookings.id (nullable)
  delta_points       integer
  reason             text
  occurred_at        timestamptz

activity_log
  id                 bigserial pk
  actor_id           uuid (nullable)
  actor_role         text
  resource_type      text          -- 'booking','fleet','customer',...
  resource_id        text          -- string so booking_reference, fleet id, etc all fit
  event              text          -- 'created','confirmed','cancelled','paid','refunded'...
  payload            jsonb
  occurred_at        timestamptz   default now()
```

Indices: `(fleet_vehicle_id, status)` and `(fleet_vehicle_id, rent_date, return_date)` on `bookings` are the critical ones for availability lookups. `booking_reference`, `customer_id`, and `pickup_location_id` are obvious secondaries.

## Module layout (NestJS)

Mirrors the existing Angular services so the migration is mechanical:

```
apps/
  api/
    src/
      modules/
        auth/                        - register, login, refresh, me
        users/                       - profile, points balance
        catalogue/                   - vehicle_catalogue CRUD (admin) + browse (public)
        fleet/                       - fleet_vehicles CRUD + availability queries
        bookings/                    - create / confirm / cancel / complete / lookup
        payments/                    - mock pay + refund, signed receipt
        discounts/                   - discount code CRUD + validation
        rewards/                     - balances + transactions
        admin-activity/              - read-only feed of activity_log
        health/                      - /healthz, /readyz
      common/
        guards/  (JwtAuthGuard, AdminGuard)
        interceptors/ (audit, response envelope)
        dto/
        prisma.service.ts
    prisma/
      schema.prisma
      migrations/
  web/                              - existing Angular app
packages/
  shared-types/                     - OpenAPI-generated DTOs consumed by both web and api
```

## How existing Angular services migrate

Each Angular service becomes a thin HTTP client around the matching API module. The response envelope stays `{ data, message, success }` so component code does not have to change.

| Angular service today | Backend module | First endpoints |
|---|---|---|
| `CarService` | `catalogue` | `GET /catalogue`, `GET /catalogue/:id`, `POST /catalogue` (admin), `PATCH`, `DELETE` |
| `FleetService` | `fleet` | `GET /fleet`, `POST /fleet`, `PATCH /fleet/:id`, `DELETE /fleet/:id` |
| `FleetAvailabilityService` | `fleet` (or new `availability` controller) | `GET /availability?catalogueItemId&pickupLocationId&from&to` |
| `RentalService` | `bookings` | `GET /bookings`, `GET /bookings/:reference`, `POST /bookings`, `PATCH /bookings/:reference/status`, `PATCH /bookings/:reference/payment` |
| `BookingFleetLifecycleService` | `bookings` | `POST /bookings/:reference/cancel`, `POST /bookings/:reference/complete`. Both endpoints atomically flip the fleet unit's status inside a transaction. |
| `PaymentService` | `payments` | `POST /payments/charge`, `POST /payments/refund` |
| `DiscountService` | `discounts` | `POST /discounts/validate`, plus admin CRUD |
| `RewardsService` | `rewards` | `POST /rewards/apply`, `GET /rewards/balance` |
| `CustomerService` | `users` | `GET /me`, `PATCH /me`, admin: `GET /users`, `PATCH /users/:id` |
| `AuthService` | `auth` | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |

The `RentalService.reloadFromStorage()` workaround (and its in-memory cache invalidation problem) disappears entirely once the server is the source of truth.

## Lifecycle correctness

Today the "cancel booking + release the fleet unit" pair is two localStorage writes. On the backend it becomes one transaction:

```ts
prisma.$transaction([
  prisma.bookings.update({ where: { booking_reference }, data: { status: 'Cancelled', cancelled_at: now } }),
  prisma.fleet_vehicles.update({ where: { id: fleet_vehicle_id }, data: { status: 'available' } }),
  prisma.activity_log.create({ data: { ... } })
]);
```

Same pattern for `Complete`, `Mark active`, and `Refund` paths. Availability queries always re-derive from `bookings` + `fleet_vehicles`, never from a denormalised flag.

## Auth model

- One `users` table; `role` decides whether `/admin/*` is reachable.
- JWT access tokens (15 min) + refresh tokens (30 days), refresh tokens stored as rows so they can be revoked.
- Passwords hashed with argon2.
- Existing Angular auth guards (`AdminGuard`, `LocalAuthGuard`) keep their public API; their implementations change to call `/auth/me`.
- The demo `admin` / `admin123` credentials are seeded by a Prisma seed script that is only run for the `development` and `demo` environments, never in production.

## Migration plan

1. **Phase A — read paths only.** Stand up the API with `catalogue`, `fleet`, `availability`, and `bookings` (read-only). Add an Angular flag (`environment.useApi`) that swaps the catalogue and availability services from localStorage-backed to HTTP-backed. The booking write path still goes to localStorage.
2. **Phase B — booking write path.** Move `POST /bookings`, `cancel`, `complete`, `payment` to the API. `localStorage` stays only as a transitional caching mechanism for offline reads; lifecycle is now authoritative on the server.
3. **Phase C — auth.** Replace the demo auth service. Customer & admin pages start going through real JWT auth.
4. **Phase D — drop localStorage.** Remove `restoreDemoCommerceData`, `repairDemoVehicleCatalogueData`, the `RentalService` in-memory cache, and the per-browser activity logs. Seed data lives in Prisma seed scripts.

Each phase is releasable on its own.

## Risks / known unknowns

- **Time zone handling.** Today the app stores dates as ISO strings or `Date` objects interchangeably. The backend should normalise to UTC dates for the `rent_date` / `return_date` pair and let the UI render in the user's locale.
- **Date-range overlap correctness.** `FleetAvailabilityService.isFleetUnitFreeForDates` has subtle boundary behaviour that should be ported as a single SQL expression and unit-tested.
- **Schema drift vs. existing demo data.** The current `selectedExtras` / `extrasTotal` / `discountCode` payloads are loosely typed; the schema above keeps them in JSONB initially to avoid a big data-modelling stall.
- **Hosting cost / persistence.** A real PostgreSQL instance adds a recurring cost the demo currently does not have. If that is a problem, a managed Postgres free tier (Neon/Supabase) is the easiest landing spot.

## Out of scope

- Real payment gateway integration. Payments stay mocked end-to-end.
- Notifications (email/SMS).
- Multi-tenant operator support.
- Telemetry/telematics on fleet vehicles.

These are easy to add later once the four lifecycle paths (Pending → Confirmed → Active → Completed plus Cancelled/Refunded) are running off PostgreSQL.
