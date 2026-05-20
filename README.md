# RentA-Car London — Angular Local Rental Demo

RentA-Car London is a local-only Angular rental platform demo for browsing vehicles, creating bookings, selecting extras, simulating payments and managing the fleet through a protected Admin area.

The application uses Angular services and `localStorage` as a mock persistence layer. No backend API is required for the demo flow.

## Current application status

This README reflects the application after the merged Admin navigation fix in PR #7, which restored the protected Admin shell navigation for Dashboard, Cars inventory, Brands inventory, Colours inventory and Bookings.

## Screenshots

> The included Admin dashboard screenshot comes from the latest running UI. The other screenshot files are documentation placeholders so the README has a complete structure; replace them with live browser captures from your local app before final publication.

| Area | Screenshot |
|---|---|
| Landing page | ![Landing page](docs/screenshots/home.png) |
| Cars catalogue | ![Cars catalogue](docs/screenshots/catalogue.png) |
| Car detail page | ![Car detail page](docs/screenshots/car-detail.png) |
| Booking extras | ![Booking extras](docs/screenshots/booking-extras.png) |
| Payment checkout | ![Payment checkout](docs/screenshots/payment.png) |
| Booking receipt | ![Booking receipt](docs/screenshots/receipt.png) |
| Customer account | ![Customer account](docs/screenshots/account.png) |
| Admin dashboard | ![Admin dashboard](docs/screenshots/admin-dashboard.png) |
| Admin cars inventory | ![Admin cars inventory](docs/screenshots/admin-cars.png) |

## Functionality

### Public catalogue

- Home page with dynamic featured vehicle selected from the local catalogue.
- Featured vehicle image/title links to the vehicle detail page.
- Featured vehicle booking CTA links to the rental flow.
- Discreet Admin link in the bottom-right corner of the landing page.
- Cars catalogue with search, brand filter, colour filter, price range filtering and sorting.
- Vehicle cards with image fallback handling for missing or invalid image paths.
- Car detail page at `/cars/:carId` with large image, vehicle metadata, price, date selection and booking CTA.

### Booking workflow

- Rental flow at `/car/rental/:carId`.
- Pickup and return date selection.
- Selecting a pickup date automatically adjusts the return date when required.
- Rental duration selector with preset and custom day count options.
- Date-based rental price calculation.
- Availability conflict detection for overlapping bookings.
- London pickup locations including major London airports and terminals:
  - Heathrow Terminal 2
  - Heathrow Terminal 3
  - Heathrow Terminal 4
  - Heathrow Terminal 5
  - Gatwick North Terminal
  - Gatwick South Terminal
  - Stansted Main Terminal
  - Luton Main Terminal
  - London City Main Terminal
  - Southend Main Terminal
- Booking extras/services selection:
  - Basic insurance cover
  - Full insurance cover
  - Additional driver
  - Child seat
  - GPS navigation
  - Roadside assistance plus
  - Airport pickup / terminal meet-and-greet
  - Fuel pre-purchase
- Price breakdown for vehicle subtotal, extras subtotal and grand total.
- Unique booking references generated using booking and vehicle data.
- Copy booking reference support.
- Booking lookup by reference and customer email.

### Customer account flow

- Local demo customer registration.
- Local demo customer login/logout.
- Customer session stored in `localStorage`.
- Logged-in navbar state:
  - logged-out users see Login and Register;
  - logged-in users see `My Account - {FirstName}` and Logout.
- Customer account profile page at `/account`.
- Customer bookings page at `/account/bookings`.
- Account pages protected with a customer route guard.

### Mock payment flow

- Payment page at `/payment/:bookingReference`.
- Demo payment methods:
  - Credit/debit card
  - PayPal
  - Apple Pay
- Payment records stored in `localStorage`.
- Payment reference generation using `PAY-*` style references.
- Payment status and method linked back to bookings.
- Booking receipt page at `/booking-confirmation/:bookingReference`.
- Receipt page includes booking details, selected services, payment method, payment reference and total paid.
- Browser print/save-to-PDF support for receipts.

### Protected Admin area

- Admin login page at `/admin/login`.
- Protected Admin routes using a demo Admin auth guard.
- Demo Admin credentials shown on the login page:
  - Username: `admin`
  - Password: `admin123`
- Admin logout returns to the Admin login page.
- Protected Admin navigation with links to:
  - Dashboard
  - Cars inventory
  - Brands inventory
  - Colours inventory
  - Bookings
  - Booking lookup
  - Public catalogue
- Dashboard metrics based on local booking data:
  - total bookings
  - pending bookings
  - confirmed bookings
  - active bookings
  - projected revenue
  - completed revenue
  - unavailable cars today
  - most booked brand
- Cars inventory management:
  - list cars
  - add car
  - edit car
  - delete car
  - admin-only number plate visibility
- Brands inventory management:
  - list brands
  - add brand
  - edit brand
  - delete brand
- Colours inventory management:
  - list colours
  - add colour
  - edit colour
  - delete colour
- Bookings management:
  - booking reference
  - customer
  - vehicle
  - internal number plate
  - selected extras/services
  - payment status
  - payment method
  - payment reference
  - booking status workflow

## Demo credentials

### Admin

```text
Username: admin
Password: admin123
```

### Customer

Create a customer account locally via:

```text
/register
```

Then log in via:

```text
/login
```

All customer and booking data is stored locally in the browser.

## Main routes

| Route | Purpose |
|---|---|
| `/home` | Landing page |
| `/cars` | Public car catalogue |
| `/cars/:carId` | Car detail page |
| `/car/rental/:carId` | Booking flow |
| `/payment/:bookingReference` | Mock payment checkout |
| `/booking-confirmation/:bookingReference` | Booking receipt |
| `/booking-lookup` | Booking lookup by reference and email |
| `/register` | Customer registration |
| `/login` | Customer login |
| `/account` | Customer account profile |
| `/account/bookings` | Customer booking history |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Admin dashboard metrics |
| `/admin/cars` | Admin cars inventory |
| `/admin/brands` | Admin brands inventory |
| `/admin/colors` | Admin colours inventory |
| `/admin/bookings` | Admin booking management |

## Tech stack

- Angular 11
- TypeScript
- RxJS
- Bootstrap / CSS components
- `localStorage` mock persistence
- Angular route guards for customer and Admin protected areas

## Clone, install, build, test and start

### Clone

```bash
git clone https://github.com/victor-villar-turintech/Car-Rental-Angular.git
cd Car-Rental-Angular
```

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm start
```

Open:

```text
http://localhost:4200/
```

### Build

```bash
npm run build
```

The Angular build output is generated under `dist/`.

### Run unit tests

```bash
npm test
```

If you are running tests in a non-GUI environment, configure Chrome Headless in the Karma configuration first.

### Optional Angular CLI commands

```bash
npm run ng -- generate component components/example
npm run ng -- generate service services/example
```

## Local data reset

Because the demo uses `localStorage`, browser state can affect test bookings and accounts. To reset the app data during manual testing:

1. Open browser DevTools.
2. Go to Application / Storage.
3. Clear Local Storage for `http://localhost:4200`.
4. Refresh the app.

## Documentation screenshot refresh

Recommended screenshot files:

```text
docs/screenshots/home.png
docs/screenshots/catalogue.png
docs/screenshots/car-detail.png
docs/screenshots/booking-extras.png
docs/screenshots/payment.png
docs/screenshots/receipt.png
docs/screenshots/account.png
docs/screenshots/admin-dashboard.png
docs/screenshots/admin-cars.png
```

Suggested capture flow:

```text
1. Run npm start.
2. Open the app at http://localhost:4200.
3. Capture the pages listed above.
4. Save/replace the PNG files under docs/screenshots/.
5. Commit README.md and docs/screenshots/* together.
```

## Notes

This project is intentionally local-only. Credentials, bookings, payments and Admin sessions are demo data stored in the browser and should not be treated as production authentication or payment logic.
