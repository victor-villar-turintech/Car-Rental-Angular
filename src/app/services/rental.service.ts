import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Rental, RentalMetrics, RentalStatus } from '../models/rental';
import { ResponseModel } from '../models/responseModel';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private readonly storageKey = 'rent-a-car-demo-bookings';
  private rentals: Rental[] = this.loadRentals();
  private readonly availabilityBlockingStatuses: RentalStatus[] = ['Pending', 'Confirmed', 'Active'];

  getRental(): Observable<ListResponseModel<Rental>> {
    return of({ success: true, message: 'Bookings loaded.', data: this.rentals });
  }

  getBookingByReference(reference: string, email: string): Observable<ListResponseModel<Rental>> {
    const normalisedReference = this.normalise(reference);
    const normalisedEmail = this.normalise(email);

    const matches = this.rentals.filter((booking) => {
      const bookingReference = this.normalise(booking.bookingReference || `RC-${booking.rentalId}`);
      const bookingEmail = this.normalise(booking.customerEmail || '');
      return bookingReference === normalisedReference && bookingEmail === normalisedEmail;
    });

    return of({
      success: matches.length > 0,
      message: matches.length > 0 ? 'Booking found.' : 'No booking matched that reference and email.',
      data: matches,
    });
  }

  addRental(rental: Rental): Observable<ResponseModel> {
    const nextId = Math.max(...this.rentals.map((item) => item.rentalId || 0), 0) + 1;
    const now = new Date().toISOString();
    const booking: Rental = {
      ...rental,
      rentalId: rental.rentalId || nextId,
      bookingReference: rental.bookingReference || this.createBookingReference(nextId),
      status: rental.status || 'Pending',
      createdAt: rental.createdAt || now,
      updatedAt: now,
    };

    Object.assign(rental, booking);
    this.rentals = [...this.rentals, booking];
    this.saveRentals();

    return of({ success: true, message: `Booking saved. Reference: ${booking.bookingReference}` });
  }

  isRentable(rental: Rental): Observable<ResponseModel> {
    const conflict = this.findDateConflict(rental.carId, rental.rentDate, rental.returnDate, rental.rentalId);

    return of({
      success: !conflict,
      message: conflict
        ? `Unavailable for selected dates. Existing booking ${conflict.bookingReference || ''} runs ${conflict.rentDate} to ${conflict.returnDate}.`
        : 'Car is available for the selected dates.',
    });
  }

  updateRentalStatus(rentalId: number, status: RentalStatus): Observable<ResponseModel> {
    this.rentals = this.rentals.map((booking) =>
      booking.rentalId === Number(rentalId) ? { ...booking, status, updatedAt: new Date().toISOString() } : booking
    );
    this.saveRentals();
    return of({ success: true, message: 'Booking status updated.' });
  }

  updateCustomerDetails(rentalId: number, details: Pick<Rental, 'customerName' | 'customerEmail' | 'customerPhone'>): Observable<ResponseModel> {
    this.rentals = this.rentals.map((booking) =>
      booking.rentalId === Number(rentalId)
        ? { ...booking, ...details, updatedAt: new Date().toISOString() }
        : booking
    );
    this.saveRentals();
    return of({ success: true, message: 'Customer details updated.' });
  }

  getMetrics(): Observable<RentalMetrics> {
    const today = new Date().toISOString().slice(0, 10);
    const activeRevenueStatuses: RentalStatus[] = ['Pending', 'Confirmed', 'Active'];
    const brandCounts = new Map<string, number>();

    this.rentals.forEach((booking) => {
      if (booking.brandName) {
        brandCounts.set(booking.brandName, (brandCounts.get(booking.brandName) || 0) + 1);
      }
    });

    let mostBookedBrand = 'N/A';
    let mostBookedBrandCount = 0;
    brandCounts.forEach((count, brand) => {
      if (count > mostBookedBrandCount) {
        mostBookedBrand = brand;
        mostBookedBrandCount = count;
      }
    });

    const unavailableCarsToday = new Set(
      this.rentals
        .filter((booking) =>
          this.availabilityBlockingStatuses.includes(booking.status || 'Pending') &&
          this.dateOnly(booking.rentDate) <= today &&
          this.dateOnly(booking.returnDate) >= today
        )
        .map((booking) => booking.carId)
    ).size;

    return of({
      totalBookings: this.rentals.length,
      pendingBookings: this.countByStatus('Pending'),
      confirmedBookings: this.countByStatus('Confirmed'),
      activeBookings: this.countByStatus('Active'),
      completedBookings: this.countByStatus('Completed'),
      cancelledBookings: this.countByStatus('Cancelled'),
      projectedRevenue: this.rentals
        .filter((booking) => activeRevenueStatuses.includes(booking.status || 'Pending'))
        .reduce((total, booking) => total + Number(booking.totalRentPrice || 0), 0),
      completedRevenue: this.rentals
        .filter((booking) => booking.status === 'Completed')
        .reduce((total, booking) => total + Number(booking.totalRentPrice || 0), 0),
      unavailableCarsToday,
      mostBookedBrand,
    });
  }

  private findDateConflict(carId: number, rentDate?: Date | string, returnDate?: Date | string, ignoredRentalId?: number): Rental | undefined {
    const requestedStart = this.toDate(rentDate);
    const requestedEnd = this.toDate(returnDate);

    if (!requestedStart || !requestedEnd || requestedEnd < requestedStart) {
      return undefined;
    }

    return this.rentals.find((booking) => {
      if (booking.rentalId === ignoredRentalId || booking.carId !== Number(carId)) {
        return false;
      }

      if (!this.availabilityBlockingStatuses.includes(booking.status || 'Pending')) {
        return false;
      }

      const existingStart = this.toDate(booking.rentDate);
      const existingEnd = this.toDate(booking.returnDate);

      if (!existingStart || !existingEnd) {
        return false;
      }

      return requestedStart <= existingEnd && requestedEnd >= existingStart;
    });
  }

  private countByStatus(status: RentalStatus): number {
    return this.rentals.filter((booking) => booking.status === status).length;
  }

  private loadRentals(): Rental[] {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((booking) => this.normaliseBooking(booking)) : [];
    } catch {
      return [];
    }
  }

  private saveRentals(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.rentals));
  }

  private normaliseBooking(booking: Rental): Rental {
    const rentalId = Number(booking.rentalId || 0) || undefined;
    return {
      ...booking,
      rentalId,
      bookingReference: booking.bookingReference || (rentalId ? this.createBookingReference(rentalId) : undefined),
      status: booking.status || 'Pending',
    };
  }

  private createBookingReference(id: number): string {
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `RC-${yyyymmdd}-${String(id).padStart(4, '0')}`;
  }

  private toDate(value?: Date | string): Date | undefined {
    if (!value) {
      return undefined;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  private dateOnly(value?: Date | string): string {
    const date = this.toDate(value);
    return date ? date.toISOString().slice(0, 10) : '';
  }

  private normalise(value: string): string {
    return value.toLowerCase().trim();
  }
}
