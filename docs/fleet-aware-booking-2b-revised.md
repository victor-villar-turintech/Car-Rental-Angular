# Fleet-aware Booking Patch 2B Revised

This patch replaces only `/car/rental/:id` with a sleek 4-step booking flow that preserves the original workflow:

1. Vehicle
2. Details
3. Payment
4. Receipt

It restores:

- pickup location
- drop-off location
- extras/additional options
- customer details
- payment step
- receipt step

It also keeps the new fleet-aware behaviour:

- reserves one physical fleet unit
- writes `fleetVehicleId`
- writes `registrationNumber`
- writes pickup/return location fields
- marks the fleet unit as `booked`
