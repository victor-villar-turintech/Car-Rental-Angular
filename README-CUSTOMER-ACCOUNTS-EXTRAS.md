# Customer Accounts and Booking Extras

Adds localStorage-backed customer account registration/sign-in, guarded account pages, customer booking history, selectable booking extras, London airport pickup terminals, and central pricing logic.

Implemented features:

- `/register` creates a local demo customer account.
- `/login` signs into the local demo account.
- `/account` shows the customer profile.
- `/account/bookings` shows bookings linked to the signed-in customer's email.
- The booking page pre-fills customer details when signed in.
- The booking page now supports selectable extras: insurance, additional driver, child seat, GPS, roadside assistance, airport pickup, and fuel pre-purchase.
- Main London airport pickup options are available, including Heathrow Terminals 2-5, Gatwick North/South, Stansted, Luton, London City, and Southend.
- Booking totals now include vehicle subtotal, extras subtotal, and grand total.
- Admin Bookings and booking lookup show extras totals.
