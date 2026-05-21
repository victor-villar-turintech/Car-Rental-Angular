import { Injectable } from '@angular/core';

import { FleetVehicle } from '../models/fleet-vehicle.model';
import { FleetService } from './fleet.service';

export interface FleetAwareBookingSummary {
  bookingReference: string;
  customerName: string;
  customerEmail?: string;
  vehicleLabel: string;
  registrationNumber: string;
  pickupLocationName: string;
  returnLocationName: string;
  rentDate: string;
  returnDate: string;
  rentalDays: number;
  paymentMethodLabel: string;
  paymentStatus: string;
  bookingStatus: string;
  totalRentPrice: number;
  selectedExtras: any[];
}

@Injectable({
  providedIn: 'root'
})
export class BookingFleetLifecycleService {
  private readonly bookingsKey = 'rent-a-car-demo-bookings';

  private readonly blockingStatuses = [
    'pending',
    'confirmed',
    'paid',
    'active'
  ];

  private readonly nonBlockingStatuses = [
    'cancelled',
    'canceled',
    'refunded',
    'completed'
  ];

  constructor(private fleetService: FleetService) {}

  getBookings(): any[] {
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

  saveBookings(bookings: any[]): void {
    localStorage.setItem(this.bookingsKey, JSON.stringify(bookings));
  }

  getFleetVehicles(): FleetVehicle[] {
    return this.fleetService.getFleetVehicles();
  }

  getBookingSummary(booking: any): FleetAwareBookingSummary {
    return {
      bookingReference: booking.bookingReference || booking.reference || `Booking ${booking.rentalId || booking.id || ''}`,
      customerName: booking.customerName || booking.fullName || 'Customer not set',
      customerEmail: booking.customerEmail || booking.email,
      vehicleLabel: this.getVehicleLabel(booking),
      registrationNumber: booking.registrationNumber || 'Not assigned',
      pickupLocationName: booking.pickupLocationName || booking.pickupLocation || 'Pickup not set',
      returnLocationName: booking.returnLocationName || booking.dropoffLocation || booking.returnLocation || booking.pickupLocationName || booking.pickupLocation || 'Drop-off not set',
      rentDate: booking.rentDate || booking.pickupDate || '',
      returnDate: booking.returnDate || booking.dropoffDate || '',
      rentalDays: Number(booking.rentalDays || booking.days || 0),
      paymentMethodLabel: booking.paymentMethodLabel || booking.paymentMethod || 'Payment method not set',
      paymentStatus: booking.paymentStatus || 'Pending',
      bookingStatus: booking.status || booking.bookingStatus || 'Confirmed',
      totalRentPrice: Number(booking.totalRentPrice || booking.total || booking.price || 0),
      selectedExtras: Array.isArray(booking.selectedExtras) ? booking.selectedExtras : []
    };
  }

  getBookedFleetContext(fleetVehicleId: number): any | null {
    const bookings = this.getBookings();

    return bookings.find(booking =>
      Number(booking.fleetVehicleId) === Number(fleetVehicleId) &&
      this.isBlockingBooking(booking)
    ) || null;
  }

  cancelBooking(bookingReferenceOrId: string | number): any | null {
    const bookings = this.getBookings();
    let cancelledBooking: any | null = null;

    const updatedBookings = bookings.map(booking => {
      if (this.matchesBooking(booking, bookingReferenceOrId)) {
        cancelledBooking = {
          ...booking,
          status: 'Cancelled',
          bookingStatus: 'Cancelled',
          cancelledAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return cancelledBooking;
      }

      return booking;
    });

    this.saveBookings(updatedBookings);

    if (cancelledBooking?.fleetVehicleId) {
      this.releaseFleetUnit(cancelledBooking.fleetVehicleId);
    }

    return cancelledBooking;
  }

  completeBooking(bookingReferenceOrId: string | number): any | null {
    const bookings = this.getBookings();
    let completedBooking: any | null = null;

    const updatedBookings = bookings.map(booking => {
      if (this.matchesBooking(booking, bookingReferenceOrId)) {
        completedBooking = {
          ...booking,
          status: 'Completed',
          bookingStatus: 'Completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return completedBooking;
      }

      return booking;
    });

    this.saveBookings(updatedBookings);

    if (completedBooking?.fleetVehicleId) {
      this.releaseFleetUnit(completedBooking.fleetVehicleId);
    }

    return completedBooking;
  }

  syncFleetStatusesFromBookings(): void {
    const bookings = this.getBookings();
    const fleet = this.fleetService.getFleetVehicles();

    const blockingFleetIds = new Set(
      bookings
        .filter(booking => booking.fleetVehicleId && this.isBlockingBooking(booking))
        .map(booking => Number(booking.fleetVehicleId))
    );

    const updatedFleet = fleet.map(vehicle => {
      if (blockingFleetIds.has(Number(vehicle.id))) {
        return {
          ...vehicle,
          status: 'booked' as any
        };
      }

      if (String(vehicle.status || '').toLowerCase() === 'booked') {
        return {
          ...vehicle,
          status: 'available' as any
        };
      }

      return vehicle;
    });

    this.fleetService.saveFleetVehicles(updatedFleet);
  }

  isBlockingBooking(booking: any): boolean {
    const status = String(booking.status || booking.bookingStatus || booking.paymentStatus || '').toLowerCase();

    if (!status) {
      return true;
    }

    if (this.nonBlockingStatuses.includes(status)) {
      return false;
    }

    return this.blockingStatuses.includes(status);
  }

  private releaseFleetUnit(fleetVehicleId: number): void {
    const fleet = this.fleetService.getFleetVehicles();
    const updatedFleet = fleet.map(vehicle =>
      Number(vehicle.id) === Number(fleetVehicleId)
        ? { ...vehicle, status: 'available' as any }
        : vehicle
    );

    this.fleetService.saveFleetVehicles(updatedFleet);
  }

  private matchesBooking(booking: any, bookingReferenceOrId: string | number): boolean {
    return String(booking.bookingReference) === String(bookingReferenceOrId) ||
      String(booking.rentalId) === String(bookingReferenceOrId) ||
      String(booking.id) === String(bookingReferenceOrId);
  }

  private getVehicleLabel(booking: any): string {
    const make = booking.brandName || booking.make;
    const model = booking.carName || booking.model;
    const year = booking.modelYear || booking.year;

    return [year, make, model].filter(Boolean).join(' ') || 'Vehicle not set';
  }
}
