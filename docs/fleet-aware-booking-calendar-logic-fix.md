# Fleet-aware Booking Calendar Logic Fix

This patch restores calendar behaviour removed during the new sleek booking flow implementation.

## Restored

- rental length field;
- return date automatically updates when pickup date changes;
- return date automatically updates when rental length changes;
- changing return date recalculates rental length;
- start date required error;
- return date required error;
- return date cannot be before pickup date;
- rental length min/max validation;
- availability refresh after date changes.

## Validation

Open `/car/rental/1` and test:

1. Clear pickup date and try to continue.
2. Set pickup date.
3. Change rental length to 3 days.
4. Confirm return date updates automatically.
5. Set return date earlier than pickup date.
6. Confirm error or correction.
7. Confirm availability count refreshes.
