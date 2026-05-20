# Booking reference and date UX patch

This patch adds the next booking UX/data model improvements:

- Featured vehicle links from the landing page to vehicle details and direct booking.
- Pickup date auto-synchronisation: selecting a pickup date sets the return date when needed.
- Rental duration selector with preset and custom day counts.
- Return date recalculates when duration changes; duration recalculates when return date changes.
- Admin-only fictitious vehicle number plates generated for catalogue cars.
- Booking references generated from vehicle/date/customer data using a deterministic hash source that includes the internal number plate.
- Booking reference copy button after confirmation.
- Admin Cars and Admin Bookings show number plates; customer-facing pages do not show them.

Apply this patch over the combined branch that already contains Admin actions, dynamic featured car, rental workflow and booking availability/status features.
