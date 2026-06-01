import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FleetAvailabilityService } from './fleet-availability.service';
import { FleetService } from './fleet.service';
import { VehicleCatalogueService } from './vehicle-catalogue.service';
import { FleetVehicle } from '../models/fleet-vehicle.model';
import { VehicleCatalogueItem } from '../models/vehicle-catalogue-item.model';

class FleetServiceStub {
  private fleet: FleetVehicle[] = [];
  setFleet(fleet: FleetVehicle[]): void { this.fleet = fleet.map((u) => ({ ...u })); }
  getFleetVehicles(): FleetVehicle[] { return this.fleet.map((u) => ({ ...u })); }
  saveFleetVehicles(fleet: FleetVehicle[]): void { this.fleet = fleet.map((u) => ({ ...u })); }
}

class VehicleCatalogueServiceStub {
  private catalogue: VehicleCatalogueItem[] = [];
  setCatalogue(catalogue: VehicleCatalogueItem[]): void { this.catalogue = catalogue.map((c) => ({ ...c })); }
  getCatalogueItems(): VehicleCatalogueItem[] { return this.catalogue.map((c) => ({ ...c })); }
}

const BOOKINGS_KEY = 'rent-a-car-demo-bookings';

function buildFleetUnit(overrides: Partial<FleetVehicle> = {}): FleetVehicle {
  return {
    id: 1,
    catalogueItemId: 1,
    registrationNumber: 'CR001',
    colour: 'Red',
    mileage: 0,
    status: 'available',
    currentLocationId: 1,
    ...overrides
  };
}

describe('FleetAvailabilityService', () => {
  let service: FleetAvailabilityService;
  let fleetService: FleetServiceStub;
  let catalogueService: VehicleCatalogueServiceStub;

  beforeEach(() => {
    localStorage.clear();
    fleetService = new FleetServiceStub();
    catalogueService = new VehicleCatalogueServiceStub();

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FleetAvailabilityService,
        { provide: FleetService, useValue: fleetService },
        { provide: VehicleCatalogueService, useValue: catalogueService }
      ]
    });
    service = TestBed.inject(FleetAvailabilityService);
  });

  describe('getRentalLocations', () => {
    it('seeds MOCK_RENTAL_LOCATIONS when nothing is stored', () => {
      const locations = service.getRentalLocations();
      expect(locations.length).toBe(3);
      expect(localStorage.getItem('rentalLocations')).not.toBeNull();
    });

    it('returns the stored locations when present', () => {
      const stored = [{ id: 99, name: 'Test', type: 'branch', isActive: true }];
      localStorage.setItem('rentalLocations', JSON.stringify(stored));
      const locations = service.getRentalLocations();
      expect(locations.length).toBe(1);
      expect(locations[0].id).toBe(99);
    });
  });

  describe('getFleetUnitsForCatalogueItem', () => {
    it('filters to only units pointing at the catalogue item', () => {
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4 }),
        buildFleetUnit({ id: 2, catalogueItemId: 4 }),
        buildFleetUnit({ id: 3, catalogueItemId: 7 })
      ]);
      const result = service.getFleetUnitsForCatalogueItem(4);
      expect(result.map((u) => u.id)).toEqual([1, 2]);
    });
  });

  describe('getAvailableFleetUnits', () => {
    it('hides units that are booked or in maintenance', () => {
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4, status: 'available' }),
        buildFleetUnit({ id: 2, catalogueItemId: 4, status: 'booked' }),
        buildFleetUnit({ id: 3, catalogueItemId: 4, status: 'maintenance' })
      ]);
      const result = service.getAvailableFleetUnits(4);
      expect(result.map((u) => u.id)).toEqual([1]);
    });

    it('restricts to pickup location when provided', () => {
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4, status: 'available', currentLocationId: 1 }),
        buildFleetUnit({ id: 2, catalogueItemId: 4, status: 'available', currentLocationId: 2 }),
        buildFleetUnit({ id: 3, catalogueItemId: 4, status: 'available', currentLocationId: 3 })
      ]);
      const heathrow = service.getAvailableFleetUnits(4, undefined, undefined, 2);
      expect(heathrow.map((u) => u.id)).toEqual([2]);
    });

    it('excludes a unit that is already booked for the requested date range', () => {
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4, status: 'available' })
      ]);
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([
        {
          bookingReference: 'CR-X',
          fleetVehicleId: 1,
          rentDate: '2026-05-10',
          returnDate: '2026-05-14',
          status: 'Confirmed'
        }
      ]));
      const overlap = service.getAvailableFleetUnits(4, '2026-05-12', '2026-05-16');
      const cleared = service.getAvailableFleetUnits(4, '2026-05-20', '2026-05-22');
      expect(overlap.length).toBe(0);
      expect(cleared.length).toBe(1);
    });

    it('ignores cancelled bookings when checking date overlap', () => {
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4, status: 'available' })
      ]);
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([
        {
          bookingReference: 'CR-X',
          fleetVehicleId: 1,
          rentDate: '2026-05-10',
          returnDate: '2026-05-14',
          status: 'Cancelled'
        }
      ]));
      const overlap = service.getAvailableFleetUnits(4, '2026-05-12', '2026-05-13');
      expect(overlap.length).toBe(1);
    });
  });

  describe('getAvailabilitySummary', () => {
    it('reports counts and locations for an available catalogue item', () => {
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4, status: 'available', currentLocationId: 1 }),
        buildFleetUnit({ id: 2, catalogueItemId: 4, status: 'available', currentLocationId: 2 }),
        buildFleetUnit({ id: 3, catalogueItemId: 4, status: 'booked', currentLocationId: 3 })
      ]);
      const summary = service.getAvailabilitySummary(4);
      expect(summary.totalFleetCount).toBe(3);
      expect(summary.availableCount).toBe(2);
      expect(summary.availableLocationIds.sort()).toEqual([1, 2]);
      expect(summary.statusLabel).toContain('available');
    });

    it('returns the unavailable label when no units are available', () => {
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4, status: 'booked' })
      ]);
      const summary = service.getAvailabilitySummary(4);
      expect(summary.availableCount).toBe(0);
      expect(summary.statusLabel).toBe('Currently unavailable');
    });
  });

  describe('reserveFleetUnit', () => {
    it('marks the chosen unit as booked and returns it', () => {
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4, status: 'available', currentLocationId: 1 })
      ]);
      const reserved = service.reserveFleetUnit(4, '2026-05-01', '2026-05-04', 1);
      expect(reserved).not.toBeNull();
      expect((reserved as any).status).toBe('booked');
      expect(fleetService.getFleetVehicles()[0].status).toBe('booked');
    });

    it('returns null when no unit is available', () => {
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4, status: 'booked' })
      ]);
      const reserved = service.reserveFleetUnit(4, '2026-05-01', '2026-05-04', 1);
      expect(reserved).toBeNull();
    });
  });

  describe('releaseFleetUnit', () => {
    it('flips the unit back to available', () => {
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4, status: 'booked' })
      ]);
      service.releaseFleetUnit(1);
      expect(fleetService.getFleetVehicles()[0].status).toBe('available');
    });
  });

  describe('buildBookingSelection', () => {
    it('returns null when catalogue item is unknown', () => {
      catalogueService.setCatalogue([]);
      const result = service.buildBookingSelection(99, '2026-05-01', '2026-05-04', 1, 1);
      expect(result).toBeNull();
    });

    it('reserves a unit and resolves pickup + return locations', () => {
      catalogueService.setCatalogue([
        { id: 4, displayName: 'BMW 3 Series M Sport', baseDailyPrice: 92 } as any
      ]);
      fleetService.setFleet([
        buildFleetUnit({ id: 1, catalogueItemId: 4, status: 'available', currentLocationId: 1 })
      ]);
      const selection = service.buildBookingSelection(4, '2026-05-01', '2026-05-04', 1, 2);
      expect(selection).not.toBeNull();
      expect((selection as any).fleetVehicle.id).toBe(1);
      expect((selection as any).pickupLocation.id).toBe(1);
      expect((selection as any).returnLocation.id).toBe(2);
    });
  });
});
