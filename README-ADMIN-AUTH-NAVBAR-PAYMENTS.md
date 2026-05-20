# Admin auth, navbar state and mock payments

This patch adds the next UX/security/payment batch:

- Removes the public `Open admin` CTA from the landing page.
- Adds local demo admin login at `/admin/login`.
- Protects `/admin/**` routes with `AdminAuthGuard`.
- Shows demo admin credentials on the admin login page.
- Adds customer-aware navbar behaviour: Login/Register are hidden after customer login and replaced with `My Account - {FirstName}` and Logout.
- Adds mock payment checkout at `/payment/:bookingReference`.
- Supports Card, PayPal and Apple Pay demo payment methods.
- Stores local payment records in `localStorage`.
- Updates bookings with payment status, method and transaction reference.
- Adds receipt page at `/booking-confirmation/:bookingReference` with print/save-PDF support.

Demo admin credentials:

- Username: `admin`
- Password: `admin123`

This is front-end-only demo security and payment handling. It is not production authentication or payment processing.
