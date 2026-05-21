# Fleet-aware Booking 2B Revised — services and payments restoration

This patch restores functionality that was lost in the sleek revised rental layout without changing the overall layout direction.

## Restored/enhanced

- Multiple payment methods:
  - credit/debit card
  - PayPal
  - Apple Pay
  - Google Pay
  - pay at branch
- Payment method is stored on the booking:
  - `paymentMethod`
  - `paymentMethodLabel`
  - `paymentStatus`
- More complete additional services list:
  - drivers
  - protection
  - equipment
  - convenience
- Discovery of extras from localStorage when present.
- Customer detail fields:
  - address/notes
  - driver licence
  - flight number
- Receipt shows payment method, payment status, extras count, pickup/drop-off, and registration.
