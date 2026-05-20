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


## Latest Angular CRM, Rewards and Comparison updates

The app now includes additional Angular-focused functionality on top of the rental workflow:

- Reward redemption validation on checkout, including maximum redeemable point guidance.
- Customer favourites and recently viewed vehicles, surfaced from the customer account area.
- Shared UI state components for loading, empty and error states.
- Reusable confirmation dialog component for safer destructive actions.
- Admin reward settings page for local demo loyalty configuration.
- Admin discount analytics page showing usage, discount value and revenue after discounts.
- Vehicle comparison page at `/compare` with a dashboard-style comparison of price, engine size, horsepower, estimated range, seats, luggage capacity, drivetrain, economy and CO₂ band.

### New routes

| Route | Purpose |
|---|---|
| `/compare` | Compare up to five vehicles using pricing and specification metrics. |
| `/account/favourites` | View favourite and recently viewed vehicles. |
| `/admin/reward-settings` | Maintain local demo loyalty earning/redemption rules. |
| `/admin/discount-analytics` | Review discount code usage and promotional impact. |

### Notes on vehicle metrics

The comparison dashboard uses explicit vehicle fields when present and otherwise derives sensible demo values from the local catalogue. A future data-quality pass can enrich the mock car database with full specification fields such as `engineSize`, `horsepower`, `rangeMiles`, `seats`, `luggageCapacityLitres`, `bootCapacityLitres`, `drivetrain`, `fuelEconomyMpg` and `co2Band`.


### Latest local comparison/navigation polish

The Angular demo now includes a professionalised top navigation, a refined featured vehicle card, direct `Compare` actions from the vehicle catalogue, and a richer `/compare` dashboard. The comparison page supports browsing/filtering vehicles by size, vehicle type, number of seats, transmission, fuel type, and maximum daily price before comparing up to five vehicles side by side.

Comparison metrics currently use explicit vehicle fields when present and demo fallbacks otherwise, covering engine size, horsepower, estimated range, seat count, luggage capacity, boot capacity, drivetrain, fuel economy, fuel type, and CO₂ band. A later data-enrichment pass can move these values into the car database and expose them in Admin Cars add/edit.


The comparison flow starts empty, supports explicit Add to compare and Reset comparison controls, allows up to five selected vehicles, and horizontally scrolls on smaller screens.


### Comparison dashboard polish

The `/compare` workflow starts empty by default, lets users filter the catalogue, add explicit vehicles to compare, reset the comparison, and review up to five vehicles side by side with horizontal scrolling on smaller screens.


### Admin vehicle specification visibility

The protected Admin Cars inventory now exposes richer vehicle specification information alongside the fleet records, including engine size, horsepower, fuel type, drivetrain, range, seats, luggage capacity, boot capacity, fuel economy and emissions band. These values are displayed for demo comparison/admin visibility and are derived from explicit vehicle fields where present, with sensible local demo fallbacks for the mock catalogue.
