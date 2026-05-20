# Screenshot capture guide

Run the app locally:

```bash
npm install
npm start
```

Open `http://localhost:4200` and refresh the screenshots referenced by the README.

Recommended files:

```text
docs/screenshots/home.png
docs/screenshots/catalogue.png
docs/screenshots/car-detail.png
docs/screenshots/booking-extras.png
docs/screenshots/payment.png
docs/screenshots/receipt.png
docs/screenshots/account.png
docs/screenshots/customer-bookings.png
docs/screenshots/admin-dashboard.png
docs/screenshots/admin-cars.png
docs/screenshots/admin-extras.png
docs/screenshots/admin-payments.png
```

Suggested routes:

```text
/home
/home scroll to Popular choices / trust section
/cars
/cars/1
/car/rental/1
/payment/<booking-reference>
/booking-confirmation/<booking-reference>
/account
/account/bookings
/admin/dashboard
/admin/cars
/admin/extras
/admin/payments
```

Admin demo credentials:

```text
Username: admin
Password: admin123
```

Capture the polished featured vehicle hero, popular vehicle cards, trust/benefits section and revised How It Works section after applying the homepage polish patch.

After replacing screenshots, run:

```bash
git status
npm run build
git add README.md docs/screenshots
git commit -m "Update README screenshots"
```
