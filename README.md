# RentA-Car London — Angular Demo Fleet Platform

RentA-Car London is an Angular 11 demo application for a realistic vehicle rental workflow. It uses local mock data and browser `localStorage` instead of a backend API, making it easy to clone, run, demo, reset and extend.

The application now covers the full demo flow: vehicle catalogue, booking workflow, optional extras, London airport pickup locations, customer accounts, mock payments, receipts, Admin management, rewards, discount codes, customer activity, comparison and demo reset tooling.

> This is a frontend-only demo. Customer, booking, payment, reward, discount and admin data are stored locally in the browser.

---

## Screenshots

The repository contains the original README screenshot set under `Readme-Images/`. These images are kept so GitHub renders screenshots directly in the README.

### Home and catalogue

![Homepage](Readme-Images/HomePage.PNG)

![Homepage section](Readme-Images/HomePage2.PNG)

![Homepage fleet section](Readme-Images/HomePage3.PNG)

![Cars catalogue](Readme-Images/CarsPage.PNG)

### Customer account

![Login page](Readme-Images/LoginPage.PNG)

![Register page](Readme-Images/RegisterPage.PNG)

![User profile](Readme-Images/UserProfile.PNG)

### Admin inventory

![Admin page](Readme-Images/AdminPage.PNG)

![Car update](Readme-Images/CarUpdate.PNG)

![Colour management](Readme-Images/ColorPage.PNG)

Newer flows such as `/compare`, `/account/rewards`, `/admin/customers`, `/admin/discount-analytics` and `/admin/reward-settings` should be captured into `docs/screenshots/` using `docs/screenshots/CAPTURE_GUIDE.md`.

---

## Current functionality

### Public homepage and catalogue

- Professional landing page with dynamic featured vehicle spotlight.
- Featured vehicle links to vehicle details and direct reservation.
- Dynamic popular vehicle choices from the local catalogue.
- Trust/benefits and “How it works” sections.
- Browse local mock fleet catalogue.
- Search, filter and sort vehicles.
- Query-param friendly catalogue filtering where implemented.
- Vehicle detail pages with full vehicle information, image, pricing and booking CTA.
- Favourite and recently viewed vehicle support.
- Compare actions from the catalogue.
- Back-to-top control on long catalogue and booking pages.

### Vehicle comparison

The `/compare` page provides a dashboard-style comparison workflow:

- Starts empty by default.
- Browse and filter vehicles before adding them to the comparison.
- Filter by search term, vehicle size, type/category, seats, transmission, fuel type and maximum daily price.
- Explicit **Add to compare** action on matching vehicles.
- **Reset comparison** control.
- Supports up to five selected vehicles.
- Comparison dashboard appears below matching vehicles.
- Horizontal scrolling on smaller screens.
- Comparison metrics include daily price, engine size, horsepower, range, seats, luggage capacity, boot capacity, drivetrain, fuel economy, fuel type and CO₂ band.
- Metrics use explicit vehicle fields where available and sensible local demo fallbacks otherwise.

### Booking workflow

- Date-based rental price calculation.
- Pickup date and return date support.
- Rental length selector.
- Automatic return-date update from rental duration.
- Optional extras and insurance services.
- London pickup locations, including main London airports and terminals.
- Booking reference generation based on vehicle/date characteristics.
- Booking lookup by reference and email.
- Booking confirmation page.
- Customer cancellation and mock refund handling.
- Print-friendly receipt page.

### Mock payments

- Payment checkout by booking reference.
- Card, PayPal and Apple Pay mock payment options.
- Payment transaction reference generation using `PAY-*` references.
- Payment status, method and reference shown in Admin Bookings.
- Discount code application during checkout.
- Reward point redemption during checkout.
- Reward redemption validation so users cannot redeem more points than available or more than the booking total can absorb.

### Customer account

- Local customer registration and login.
- Logged-out navbar shows Login/Register.
- Logged-in navbar shows account access and logout.
- Account profile page.
- Customer booking history.
- Customer favourites and recently viewed vehicles at `/account/favourites`.
- Customer rewards page at `/account/rewards`.
- Customer activity page at `/account/activity`.
- Local profile/customer data persisted in browser `localStorage`.

### Rewards and loyalty

- Local loyalty account per customer.
- Points earned from paid bookings.
- First paid booking bonus where configured.
- Reward transaction history.
- Reward redemption during payment.
- Admin reward management and manual point adjustments.
- Admin reward settings page for demo rules.

### Discount codes

- Local discount-code service.
- Discount codes can be active/inactive.
- Fixed-amount and percentage discount support.
- Minimum-spend validation.
- Expiry and usage-limit handling where configured.
- Admin discount code management.
- Admin discount analytics page showing promotional impact.

### Protected Admin console

Protected admin area with demo credentials:

```text
Username: admin
Password: admin123
```

Admin functionality includes:

- Protected `/admin` routes.
- Admin login/logout.
- Dashboard metrics.
- Cars inventory management.
- Richer Admin Cars specification visibility: engine size, horsepower, fuel type, drivetrain, range, seats, luggage capacity, boot capacity, fuel economy and emissions band.
- Brands inventory management.
- Colours inventory management.
- Bookings management.
- Extras management.
- Payments dashboard.
- Customer management.
- Mock password reset link generation.
- Customer activity log.
- Rewards management and manual point adjustments.
- Reward settings.
- Discount code management.
- Discount analytics.
- Admin activity log.
- Demo reset tools.

---

## Main routes

| Area | Route | Purpose |
|---|---|---|
| Home | `/home` | Landing page and featured vehicle |
| Catalogue | `/cars` | Browse, filter and compare cars |
| Vehicle detail | `/cars/:carId` | Vehicle details and booking CTA |
| Vehicle comparison | `/compare` | Compare up to five vehicles |
| Rental booking | `/car/rental/:carId` | Select dates, extras and customer details |
| Payment checkout | `/payment/:bookingReference` | Mock Card/PayPal/Apple Pay payment |
| Receipt | `/booking-confirmation/:bookingReference` | Booking and payment receipt |
| Booking lookup | `/booking-lookup` | Lookup booking by reference/email |
| Customer login | `/login` | Local customer login |
| Customer register | `/register` | Local customer registration |
| Customer account | `/account` | Profile and account navigation |
| Customer bookings | `/account/bookings` | Customer booking history |
| Customer favourites | `/account/favourites` | Favourite and recently viewed vehicles |
| Customer rewards | `/account/rewards` | Points balance and reward history |
| Customer activity | `/account/activity` | Customer activity timeline |
| Admin login | `/admin/login` | Admin authentication |
| Admin dashboard | `/admin/dashboard` | Admin overview |
| Admin cars | `/admin/cars` | Vehicle inventory/spec visibility |
| Admin brands | `/admin/brands` | Brand management |
| Admin colours | `/admin/colors` | Colour management |
| Admin bookings | `/admin/bookings` | Booking management |
| Admin extras | `/admin/extras` | Optional extras management |
| Admin payments | `/admin/payments` | Payment status dashboard |
| Admin customers | `/admin/customers` | Customer CRM management |
| Admin customer activity | `/admin/customer-activity` | Customer activity log |
| Admin rewards | `/admin/rewards` | Reward accounts and transactions |
| Admin reward settings | `/admin/reward-settings` | Loyalty rule configuration |
| Admin discounts | `/admin/discounts` | Discount code management |
| Admin discount analytics | `/admin/discount-analytics` | Discount usage and impact |
| Admin activity | `/admin/activity` | Admin activity log |
| Admin settings | `/admin/settings` | Demo reset tools |

---

## Tech stack

- Angular 11.
- TypeScript.
- Angular Router.
- Angular Forms and Reactive Forms.
- Bootstrap-style layout/classes.
- `ngx-toastr` for notifications.
- Browser `localStorage` for demo persistence.
- Mock services for vehicles, rentals, payments, extras, customers, rewards, discounts and activity logs.
- Karma/Jasmine test setup from the original Angular project.

---

## Prerequisites

This project uses an older Angular/Webpack stack. With Node 17+ / Node 20, Webpack 4 can fail with:

```text
ERR_OSSL_EVP_UNSUPPORTED
```

Use either Node 14/16, or set the legacy OpenSSL provider for Node 20.

Recommended quick setup on Node 20:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
```

Recommended long-term setup:

```bash
nvm install 16
nvm use 16
```

---

## Clone, install, build, test and start

```bash
git clone https://github.com/victor-villar-turintech/Car-Rental-Angular.git
cd Car-Rental-Angular
```

Install dependencies:

```bash
npm install
```

Build on Node 20:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm run build
```

Build on Node 14/16:

```bash
npm run build
```

Run tests:

```bash
npm test -- --watch=false
```

If Karma/Chrome hangs or fails because of the local browser setup, stop it with `Ctrl + C` and use `npm run build` plus manual route validation as the primary demo validation.

Start the app:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

Open:

```text
http://localhost:4200
```

---

## Manual validation checklist

After a clean build, validate:

```text
/home
/cars
/compare
/cars/1
/car/rental/1
/payment/<booking-reference>
/booking-confirmation/<booking-reference>
/booking-lookup
/login
/register
/account
/account/bookings
/account/favourites
/account/rewards
/account/activity
/admin/login
/admin/dashboard
/admin/cars
/admin/bookings
/admin/extras
/admin/payments
/admin/customers
/admin/customer-activity
/admin/rewards
/admin/reward-settings
/admin/discounts
/admin/discount-analytics
/admin/activity
/admin/settings
```

Key checks:

- Homepage featured vehicle looks professional and links to detail/booking.
- Catalogue filtering and compare actions work.
- `/compare` starts empty, supports Add to compare, Reset comparison, five vehicles and horizontal scrolling.
- Booking dates, duration, extras and totals update correctly.
- Payment supports discount codes and reward points.
- Customer rewards/activity/favourites pages load.
- Admin cars shows rich vehicle specs.
- Admin customers/rewards/discounts/analytics pages load.
- Demo reset tools clear local demo data.

---

## Demo data and localStorage

The app stores demo data in `localStorage`, including:

- customers
- bookings
- payments
- extras
- discounts
- rewards
- activity logs
- favourite vehicles
- recently viewed vehicles

Reset from the UI:

```text
/admin/settings
```

Manual browser reset from DevTools:

```javascript
localStorage.clear();
location.reload();
```

---

## Screenshot maintenance

Existing screenshot assets live in:

```text
Readme-Images/
docs/screenshots/
```

Use the capture guide to refresh screenshots after UI changes:

```text
docs/screenshots/CAPTURE_GUIDE.md
```

When replacing screenshots, keep filenames stable where possible so README links do not break.

---

## Notes and future improvements

Useful future improvements:

- Split vehicle data into a model catalogue and physical fleet inventory:
  - model catalogue: make, model, engine size, HP, range, seats, boot/luggage capacity, drivetrain, fuel type, economy, emissions.
  - fleet inventory: colour, number plate, mileage, location, status and availability.
- Add Admin add/edit support for all rich vehicle specification fields.
- Replace remaining template-driven forms with Reactive Forms where useful.
- Replace remaining `window.confirm()` calls with the reusable confirmation dialog.
- Add stronger automated tests for pricing, payment, discount and rewards services.
- Upgrade Angular and Webpack to remove the OpenSSL legacy provider requirement.

---

## About

Angular car rental demo using local mock catalogue data.
