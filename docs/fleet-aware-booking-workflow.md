# Batch 2A — Fleet-aware booking foundation

This patch adds the foundation for fleet-aware booking without changing the public booking UI yet.

## Added

- `FleetAvailabilityService`
- date-overlap availability logic
- fleet unit reservation/release helpers
- rental location seeding helper
- booking enrichment helper for legacy-compatible booking records
- optional fleet-aware booking fields on existing booking/rental interfaces where detected

## Next patch

Patch 2B should wire this service into:

- `/cars`
- `/car/rental/:id`
- booking submit logic
- pickup/return branch selectors
