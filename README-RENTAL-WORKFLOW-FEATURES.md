# Rental workflow feature patch

This patch adds the next rental workflow layer to the Angular demo:

1. Car detail page route: `/cars/:carId`.
2. Vehicle detail page with large image, badges, specs, price and rent CTA.
3. Date-based rental estimate using pickup and return dates.
4. Booking confirmation page with mock customer form.
5. localStorage-backed bookings through `RentalService`.
6. Admin Bookings page at `/admin/bookings`.
7. Catalogue search, brand filter, colour filter, price filters and sorting.

The patch is intentionally local-only and does not require a backend API.
