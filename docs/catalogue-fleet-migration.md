# Catalogue/Fleet Migration

This patch makes the new catalogue/fleet seed path read from the legacy cars/brands/colours mock data.

## Source of truth direction

- `VehicleCatalogueItem` becomes the shared model/specification record.
- `FleetVehicle` becomes the physical rentable unit.
- Legacy Cars/Brands/Colours remain temporarily for compatibility.
- `/admin/cars`, `/admin/brands`, and `/admin/colors` should be treated as legacy routes after this patch.

## Browser localStorage reset

If the browser has already seeded old catalogue/fleet demo data, clear these keys and reload:

```js
localStorage.removeItem('vehicleCatalogue');
localStorage.removeItem('fleetVehicles');
localStorage.removeItem('rentalLocations');
localStorage.removeItem('catalogueFleetMigrationV1Complete');
location.reload();
```

After reload, `VehicleCatalogueService` and `FleetService` will re-seed from the legacy mock cars/brands/colours data.
