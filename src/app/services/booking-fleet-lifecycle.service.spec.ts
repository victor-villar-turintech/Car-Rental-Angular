import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BookingFleetLifecycleService } from './booking-fleet-lifecycle.service';
import { FleetService } from './fleet.service';
import { FleetVehicle } from '../models/fleet-vehicle.model';

class FleetServiceStub {
  private fleet: FleetVehicle[] = [];

  setFleet(fleet: FleetVehicle[]): void {
    this.fleet = fleet.map((unit) => ({ ...unit }));
  }

  getFleetVehicles(): FleetVehicle[] {
    return this.fleet.map((unit) => ({ ...unit }));
  }

  saveFleetVehicles(fleet: FleetVehicle[]): void {
    this.fleet = fleet.map((unit) => ({ ...unit }));
  }
}

const BOOKINGS_KEY = 'rent-a-car-demo-bookings';

describe('BookingFleetLifecycleService', () => {
  let service: BookingFleetLifecycleService;
  let fleetService: FleetServiceStub;

  beforeEach(() => {
    localStorage.clear();
    fleetService = new FleetServiceStub();

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        BookingFleetLifecycleService,
        { provide: FleetService, useValue: fleetService }
      ]
    });
    service = TestBed.inject(BookingFleetLifecycleService);
  });

  describe('isBlockingBooking', () => {
    it('treats Pending, Confirmed, Paid, Active as blocking', () => {
      ['Pending', 'Confirmed', 'Paid', 'Active'].forEach((status) => {
        expect(service.isBlockingBooking({ status })).withContext(status).toBeTrue();
      });
    });

    it('treats Cancelled, Refunded, Completed as non-blocking', () => {
      ['Cancelled', 'Refunded', 'Completed'].forEach((status) => {
        expect(service.isBlockingBooking({ status })).withContext(status).toBeFalse();
      });
    });

    it('falls through to paymentStatus when status is missing', () => {
      expect(service.isBlockingBooking({ paymentStatus: 'Paid' })).toBeTrue();
      expect(service.isBlockingBooking({ paymentStatus: 'Refunded' })).toBeFalse();
    });

    it('treats records without any status as blocking (defensive default)', () => {
      expect(service.isBlockingBooking({})).toBeTrue();
    });
  });

  describe('cancelBooking', () => {
    it('marks a matching booking as Cancelled and releases its fleet unit', () => {
      const booking = {
        bookingReference: 'CR-TEST-001',
        rentalId: 100,
        fleetVehicleId: 42,
        status: 'Confirmed'
      };
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking]));
      fleetService.setFleet([
        { id: 42, catalogueItemId: 4, registrationNumber: 'CR042', status: 'booked', colour: 'Red', mileage: 0 }
      ]);

      const result = service.cancelBooking('CR-TEST-001');

      expect(result).withContext('returned booking').not.toBeNull();
      expect(result.status).toBe('Cancelled');
      expect(result.bookingStatus).toBe('Cancelled');
      expect(result.cancelledAt).toBeTruthy();

      const saved = JSON.parse(localStorage.getItem(BOOKINGS_KEY) as string);
      expect(saved[0].status).toBe('Cancelled');

      const fleet = fleetService.getFleetVehicles();
      expect(fleet[0].status).toBe('available');
    });

    it('returns null and leaves data untouched when nothing matches', () => {
      const booking = { bookingReference: 'CR-1', rentalId: 1, fleetVehicleId: 1, status: 'Confirmed' };
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking]));
      fleetService.setFleet([
        { id: 1, catalogueItemId: 1, registrationNumber: 'CR001', status: 'booked', colour: 'Red', mileage: 0 }
      ]);

      const result = service.cancelBooking('CR-DOES-NOT-EXIST');

      expect(result).toBeNull();
      const saved = JSON.parse(localStorage.getItem(BOOKINGS_KEY) as string);
      expect(saved[0].status).toBe('Confirmed');
      expect(fleetService.getFleetVehicles()[0].status).toBe('booked');
    });

    it('matches by rentalId as well as bookingReference', () => {
      const booking = { bookingReference: 'CR-X', rentalId: 77, fleetVehicleId: 7, status: 'Paid' };
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking]));
      fleetService.setFleet([
        { id: 7, catalogueItemId: 7, registrationNumber: 'CR007', status: 'booked', colour: 'Blue', mileage: 0 }
      ]);

      const result = service.cancelBooking(77);
      expect(result.status).toBe('Cancelled');
      expect(fleetService.getFleetVehicles()[0].status).toBe('available');
    });
  });

  describe('completeBooking', () => {
    it('marks booking Completed and releases the fleet unit', () => {
      const booking = { bookingReference: 'CR-DONE', rentalId: 12, fleetVehicleId: 5, status: 'Active' };
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking]));
      fleetService.setFleet([
        { id: 5, catalogueItemId: 5, registrationNumber: 'CR005', status: 'booked', colour: 'White', mileage: 0 }
      ]);

      const result = service.completeBooking('CR-DONE');

      expect(result.status).toBe('Completed');
      expect(result.completedAt).toBeTruthy();
      expect(fleetService.getFleetVehicles()[0].status).toBe('available');
    });
  });

  describe('syncFleetStatusesFromBookings', () => {
    it('marks fleet booked when a blocking booking refers to it', () => {
      const booking = { bookingReference: 'CR-LIVE', fleetVehicleId: 3, status: 'Confirmed' };
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking]));
      fleetService.setFleet([
        { id: 3, catalogueItemId: 3, registrationNumber: 'CR003', status: 'available', colour: 'Green', mileage: 0 }
      ]);

      service.syncFleetStatusesFromBookings();

      expect(fleetService.getFleetVehicles()[0].status).toBe('booked');
    });

    it('releases a booked fleet unit when its booking has been cancelled', () => {
      const booking = { bookingReference: 'CR-CXL', fleetVehicleId: 3, status: 'Cancelled' };
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking]));
      fleetService.setFleet([
        { id: 3, catalogueItemId: 3, registrationNumber: 'CR003', status: 'booked', colour: 'Green', mileage: 0 }
      ]);

      service.syncFleetStatusesFromBookings();

      expect(fleetService.getFleetVehicles()[0].status).toBe('available');
    });

    it('leaves maintenance/inactive units alone', () => {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([]));
      fleetService.setFleet([
        { id: 10, catalogueItemId: 10, registrationNumber: 'CR010', status: 'maintenance', colour: 'Black', mileage: 0 },
        { id: 11, catalogueItemId: 11, registrationNumber: 'CR011', status: 'inactive', colour: 'Black', mileage: 0 }
      ]);

      service.syncFleetStatusesFromBookings();

      const fleet = fleetService.getFleetVehicles();
      expect(fleet.find((u) => u.id === 10).status).toBe('maintenance');
      expect(fleet.find((u) => u.id === 11).status).toBe('inactive');
    });
  });

  describe('getBookingSummary', () => {
    it('returns sensible defaults for an empty booking record', () => {
      const summary = service.getBookingSummary({});
      expect(summary.customerName).toBe('Customer not set');
      expect(summary.registrationNumber).toBe('Not assigned');
      expect(summary.bookingStatus).toBe('Confirmed');
      expect(summary.selectedExtras).toEqual([]);
    });

    it('maps populated booking fields to the summary shape', () => {
      const summary = service.getBookingSummary({
        bookingReference: 'CR-001',
        customerName: 'Jane',
        customerEmail: 'j@x',
        registrationNumber: 'AB12 CDE',
        pickupLocationName: 'A',
        returnLocationName: 'B',
        rentDate: '2026-05-01',
        returnDate: '2026-05-04',
        rentalDays: 3,
        paymentMethodLabel: 'card',
        paymentStatus: 'Paid',
        status: 'Confirmed',
        totalRentPrice: 200,
        selectedExtras: [{ name: 'GPS' }],
        brandName: 'BMW',
        carName: '3 Series',
        modelYear: 2022
      });
      expect(summary.vehicleLabel).toBe('2022 BMW 3 Series');
      expect(summary.totalRentPrice).toBe(200);
      expect(summary.selectedExtras.length).toBe(1);
    });
  });
});
