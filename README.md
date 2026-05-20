# RentA-Car London — Angular Demo Fleet Platform

RentA-Car London is a local Angular demo application for a realistic vehicle rental workflow. It uses browser `localStorage` instead of a backend API, making it easy to clone, run, demo and reset.

## Current functionality

### Public catalogue

- Dynamic homepage with professional featured vehicle spotlight.
- Featured vehicle links to vehicle details and direct reservation.
- Browse local mock fleet catalogue.
- Search, filter and sort vehicles.
- Vehicle detail pages with date selection and availability preview.
- Back-to-top control on long catalogue and booking pages.

### Booking workflow

- Date-based rental pricing.
- Rental length selector.
- Optional extras and insurance services.
- London pickup locations including main London airports and terminals.
- Booking reference generation using vehicle/date characteristics.
- Booking lookup by reference and email.
- Mock payment checkout with Card, PayPal and Apple Pay.
- Discount code application during checkout.
- Reward point redemption during checkout.
- Receipt page with print-friendly styling.

### Customer account

- Local customer registration and login.
- Logged-in navbar state with My Account link.
- Account profile page.
- Customer booking history.
- Customer activity page.
- Customer rewards page with points balance and transaction history.
- Customer cancellation and mock refund handling.

### Admin console

Protected admin area with demo credentials:

```text
Username: admin
Password: admin123
```

Admin functionality includes:

- Dashboard metrics.
- Cars inventory management.
- Brands inventory management.
- Colours inventory management.
- Bookings management.
- Extras management.
- Payments dashboard.
- Customer management.
- Mock password reset link generation.
- Customer activity log.
- Rewards management and manual point adjustments.
- Discount code management.
- Admin activity log.
- Demo reset tools.

## Main routes

| Area | Route |
| --- | --- |
| Home | `/home` |
| Catalogue | `/cars` |
| Vehicle detail | `/cars/:carId` |
| Rental booking | `/car/rental/:carId` |
| Payment checkout | `/payment/:bookingReference` |
| Receipt | `/booking-confirmation/:bookingReference` |
| Booking lookup | `/booking-lookup` |
| Customer login | `/login` |
| Customer register | `/register` |
| Customer account | `/account` |
| Customer bookings | `/account/bookings` |
| Customer rewards | `/account/rewards` |
| Customer activity | `/account/activity` |
| Admin login | `/admin/login` |
| Admin dashboard | `/admin/dashboard` |
| Admin customers | `/admin/customers` |
| Admin customer activity | `/admin/customer-activity` |
| Admin rewards | `/admin/rewards` |
| Admin discount codes | `/admin/discounts` |
| Admin extras | `/admin/extras` |
| Admin payments | `/admin/payments` |
| Admin settings | `/admin/settings` |

## Tech stack

- Angular
- TypeScript
- Reactive Forms and template-driven forms where still used by legacy screens
- Bootstrap-style layout utilities
- `localStorage` demo persistence
- Mock payment, discount and rewards services

## Clone, install, build, test and start

```bash
git clone https://github.com/victor-villar-turintech/Car-Rental-Angular.git
cd Car-Rental-Angular
npm install
npm run build
npm test
npm start
```

Then open:

```text
http://localhost:4200
```

## Demo data notes

The app stores bookings, customers, payments, extras, discount codes, activity and rewards in browser `localStorage`. To reset from the UI, log in to Admin and use:

```text
/admin/settings
```

To clear all browser demo data manually, run this in DevTools:

```js
localStorage.clear();
location.reload();
```

## Screenshots

Screenshots are stored under:

```text
docs/screenshots/
```

See:

```text
docs/screenshots/CAPTURE_GUIDE.md
```

for the current screenshot list and capture instructions.
