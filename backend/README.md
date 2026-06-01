# Car-Rental-Angular — backend

NestJS + SQLite backend that implements Phase 7 (real backend split) and Phase 8 (real authentication) of the handover plan. Sits inside the same git repo as the Angular frontend; the two communicate over HTTP.

This is **Option A** from the handover (in-repo NestJS + SQLite, no external credentials required). To migrate to PostgreSQL just swap the TypeORM driver in `src/app.module.ts`.

## Stack
- **NestJS 10**, TypeORM 0.3, `better-sqlite3` driver
- **JWT auth** (`@nestjs/jwt` + `passport-jwt`), bcrypt password hashing
- **class-validator** DTOs

## Endpoints

### Auth
- `POST /api/auth/register` → `{ email, password, firstName, lastName, phone? }` → `{ token, user }`
- `POST /api/auth/login` → `{ email, password }` → `{ token, user }`
- `GET /api/auth/me` (auth required) → current user

### Users
- `GET /api/users` (admin only)
- `PATCH /api/users/:id` (self or admin)

### Cars
- `GET /api/cars` (public)
- `GET /api/cars/:id` (public)
- `POST /api/cars` (admin)
- `PATCH /api/cars/:id` (admin)
- `DELETE /api/cars/:id` (admin)

### Bookings
- `GET /api/bookings` (auth — admin sees all, customers see theirs)
- `GET /api/bookings/:id` (auth — owner or admin)
- `POST /api/bookings` (auth)
- `PATCH /api/bookings/:id/status` (auth — customer can only cancel)

## Running locally

```bash
cd backend
npm install
cp .env.example .env       # optional - defaults work for local dev
npm run start:dev          # http://localhost:3001/api
```

To seed demo data (admin user, demo customer, sample cars):

```bash
npm run seed
```

Seeded credentials:
- Admin: `admin@rentacar.local` / `admin123`
- Customer: `demo@rentacar.local` / `demo1234`

## Connecting from the Angular frontend

The Angular app talks to this backend via the `BackendAuthService` (added in this PR). Set `useBackend: true` in `src/environments/environment.ts` to switch the auth flow from `localStorage` to real HTTP. The default remains `useBackend: false` so existing localStorage demo data keeps working.

## Migrating to PostgreSQL

Swap the TypeORM datasource in `src/app.module.ts`:

```ts
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Car, Booking],
  synchronize: false,  // use migrations in prod
});
```

Add `pg` and `typeorm-naming-strategies` to dependencies, generate migrations, deploy.

## Bundled vs hosted

This backend was deliberately designed to run alongside the frontend on the same machine. For real production deploy:
- Deploy to Render / Railway / Fly.io / your own infra
- Add `DATABASE_URL` for PostgreSQL
- Add `JWT_SECRET` (NEVER commit the real one)
- Set `NODE_ENV=production`
- Run `npm run build && npm start`
