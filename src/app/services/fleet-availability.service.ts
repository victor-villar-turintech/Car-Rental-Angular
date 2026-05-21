import { Injectable } from '@angular/core';

import { FleetVehicle } from '../models/fleet-vehicle.model';
import { RentalLocation } from '../models/rental-location.model';
import { VehicleCatalogueItem } from '../models/vehicle-catalogue-item.model';
import { MOCK_RENTAL_LOCATIONS } from '../data/mock-rental-locations';
import { FleetService } from './fleet.service';
import { VehicleCatalogueService } from './vehicle-catalogue.service';

export interface FleetAvailabilitySummary {
  catalogueItemId: number;
  totalFleetCount: number;
  availableCount: number;
  availableLocationIds: number[];
  statusLabel: string;
}

export interface FleetAwareBookingSelection {
  catalogueItem: VehicleCatalogueItem;
  fleetVehicle: FleetVehicle;
  pickupLocation?: RentalLocation;
  returnLocation?: RentalLocation;
}

@Injectable({
  providedIn: 'root'
})
export class FleetAvailabilityService {
  private readonly bookingsKey = 'rent-a-car-demo-bookings';
  private readonly rentalLocationsKey = 'rentalLocations';

  private readonly blockingStatuses = [
    'pending',
    'confirmed',
    'paid',
    'active'
  ];

  constructor(
    private fleetService: FleetService,
    private vehicleCatalogueService: VehicleCatalogueService
  ) {}

  getCatalogueItems(): VehicleCatalogueItem[] {
    return this.vehicleCatalogueService.getCatalogueItems();
  }

  getFleetVehicles(): FleetVehicle[] {
    return this.fleetService.getFleetVehicles();
  }

  getRentalLocations(): RentalLocation[] {
    const stored = localStorage.getItem(this.rentalLocationsKey);

    if (stored) {
      return JSON.parse(stored);
    }

    localStorage.setItem(this.rentalLocationsKey, JSON.stringify(MOCK_RENTAL_LOCATIONS));
    return MOCK_RENTAL_LOCATIONS;
  }

  getFleetUnitsForCatalogueItem(catalogueItemId: number): FleetVehicle[] {
    return this.getFleetVehicles()
      .filter(unit => Number(unit.catalogueItemId) === Number(catalogueItemId));
  }

  getAvailableFleetUnits(
    catalogueItemId: number,
    rentDate?: string,
    returnDate?: string,
    pickupLocationId?: number
  ): FleetVehicle[] {
    return this.getFleetUnitsForCatalogueItem(catalogueItemId)
      .filter(unit => this.isOperationallyAvailable(unit))
      .filter(unit => pickupLocationId ? Number(unit.currentLocationId) === Number(pickupLocationId) : true)
      .filter(unit => this.isFleetUnitFreeForDates(unit.id, rentDate, returnDate));
  }

  getAvailabilitySummary(catalogueItemId: number): FleetAvailabilitySummary {
    const units = this.getFleetUnitsForCatalogueItem(catalogueItemId);
    const availableUnits = this.getAvailableFleetUnits(catalogueItemId);

    const availableLocationIds = Array.from(new Set(
      availableUnits
        .map(unit => unit.currentLocationId)
        .filter((locationId): locationId is number => locationId !== undefined && locationId !== null)
    ));

    return {
      catalogueItemId,
      totalFleetCount: units.length,
      availableCount: availableUnits.length,
      availableLocationIds,
      statusLabel: availableUnits.length > 0
        ? `${availableUnits.length} available`
        : 'Currently unavailable'
    };
  }

  reserveFleetUnit(
    catalogueItemId: number,
    rentDate: string,
    returnDate: string,
    pickupLocationId?: number
  ): FleetVehicle | null {
    const availableUnit = this.getAvailableFleetUnits(
      catalogueItemId,
      rentDate,
      returnDate,
      pickupLocationId
    )[0];

    if (!availableUnit) {
      return null;
    }

    this.updateFleetVehicleStatus(availableUnit.id, 'booked');
    return {
      ...availableUnit,
      status: 'booked' as any
    };
  }

  releaseFleetUnit(fleetVehicleId: number): void {
    this.updateFleetVehicleStatus(fleetVehicleId, 'available');
  }

  buildBookingSelection(
    catalogueItemId: number,
    rentDate: string,
    returnDate: string,
    pickupLocationId?: number,
    returnLocationId?: number
  ): FleetAwareBookingSelection | null {
    const catalogueItem = this.getCatalogueItems()
      .find(item => Number(item.id) === Number(catalogueItemId));

    if (!catalogueItem) {
      return null;
    }

    const fleetVehicle = this.reserveFleetUnit(
      catalogueItemId,
      rentDate,
      returnDate,
      pickupLocationId
    );

    if (!fleetVehicle) {
      return null;
    }

    const locations = this.getRentalLocations();

    return {
      catalogueItem,
      fleetVehicle,
      pickupLocation: locations.find(location => Number(location.id) === Number(pickupLocationId)),
      returnLocation: locations.find(location => Number(location.id) === Number(returnLocationId || pickupLocationId))
    };
  }

  isFleetUnitFreeForDates(
    fleetVehicleId: number,
    requestedStart?: string,
    requestedEnd?: string
  ): boolean {
    if (!requestedStart || !requestedEnd) {
      return true;
    }

    const requestedStartDate = this.toDateOnly(requestedStart);
    const requestedEndDate = this.toDateOnly(requestedEnd);

    if (!requestedStartDate || !requestedEndDate) {
      return true;
    }

    return !this.getBookings().some(booking => {
      const bookingFleetVehicleId = Number(booking.fleetVehicleId);

      if (bookingFleetVehicleId !== Number(fleetVehicleId)) {
        return false;
      }

      if (!this.isBlockingBookingStatus(booking)) {
        return false;
      }

      const existingStart = this.toDateOnly(booking.rentDate);
      const existingEnd = this.toDateOnly(booking.returnDate);

      if (!existingStart || !existingEnd) {
        return false;
      }

      return requestedStartDate <= existingEnd && requestedEndDate >= existingStart;
    });
  }

  enrichBookingWithFleetSelection(booking: any, selection: FleetAwareBookingSelection): any {
    return {
      ...booking,

      catalogueItemId: selection.catalogueItem.id,
      fleetVehicleId: selection.fleetVehicle.id,
      registrationNumber: selection.fleetVehicle.registrationNumber,

      pickupLocationId: selection.pickupLocation?.id,
      pickupLocationName: selection.pickupLocation?.name,
      returnLocationId: selection.returnLocation?.id,
      returnLocationName: selection.returnLocation?.name,

      // Legacy compatibility fields used by current booking/admin/customer screens.
      carId: selection.catalogueItem.id,
      carName: selection.catalogueItem.model,
      brandName: selection.catalogueItem.make,
      colorName: selection.fleetVehicle.colour,
      modelYear: selection.catalogueItem.year,
      dailyPrice: selection.catalogueItem.baseDailyPrice,
      imagePath: selection.catalogueItem.imageUrl
    };
  }

  private isOperationallyAvailable(unit: FleetVehicle): boolean {
    const status = String(unit.status || '').toLowerCase();
    return status === 'available' || status === '';
  }

  private updateFleetVehicleStatus(fleetVehicleId: number, status: string): void {
    const fleetVehicles = this.getFleetVehicles();
    const updatedFleet = fleetVehicles.map(unit =>
      Number(unit.id) === Number(fleetVehicleId)
        ? { ...unit, status: status as any }
        : unit
    );

    this.fleetService.saveFleetVehicles(updatedFleet);
  }

  private getBookings(): any[] {
    const stored = localStorage.getItem(this.bookingsKey);

    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private isBlockingBookingStatus(booking: any): boolean {
    const status = String(booking.status || booking.paymentStatus || '').toLowerCase();

    if (!status) {
      return true;
    }

    return this.blockingStatuses.includes(status);
  }

  private toDateOnly(value: any): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    date.setHours(0, 0, 0, 0);
    return date;
  }
}
