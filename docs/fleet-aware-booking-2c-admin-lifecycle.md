# Fleet-aware Booking Patch 2C — Admin lifecycle

Adds admin/customer operational support around fleet-aware bookings.

## Added

- `BookingFleetLifecycleService`
- booking summary helper for fleet-aware fields
- cancel booking and release fleet unit
- complete booking and release fleet unit
- sync helper for booking/fleet status consistency
- admin bookings fleet-aware panel when the bookings component is detected
- admin fleet booked-context helper when the fleet component is detected

## Validation

1. Create a booking through `/car/rental/1`.
2. Confirm the fleet unit status is `booked`.
3. Open `/admin/bookings`.
4. Confirm registration, pickup/drop-off, payment method and extras are visible.
5. Cancel or complete the booking.
6. Confirm the fleet unit returns to `available`.
