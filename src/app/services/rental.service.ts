import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Rental } from '../models/rental';
import { ResponseModel } from '../models/responseModel';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private readonly storageKey = 'rent-a-car-demo-bookings';
  private rentals: Rental[] = this.loadRentals();

  getRental(): Observable<ListResponseModel<Rental>> {
    return of({ success: true, message: 'Bookings loaded.', data: this.rentals });
  }

  addRental(rental: Rental): Observable<ResponseModel> {
    const nextId = Math.max(...this.rentals.map((item) => item.rentalId || 0), 0) + 1;
    const booking: Rental = {
      ...rental,
      rentalId: rental.rentalId || nextId,
      status: rental.status || 'Confirmed',
      createdAt: rental.createdAt || new Date().toISOString(),
    };

    this.rentals = [...this.rentals, booking];
    this.saveRentals();

    return of({ success: true, message: 'Booking saved.' });
  }

  isRentable(rental: Rental): Observable<ResponseModel> {
    const requestedStart = this.toDate(rental.rentDate);
    const requestedEnd = this.toDate(rental.returnDate);

    if (!requestedStart || !requestedEnd || requestedEnd < requestedStart) {
      return of({ success: false, message: 'Invalid booking dates.' });
    }

    const overlapsExistingBooking = this.rentals.some((item) => {
      if (item.carId !== rental.carId || item.status === 'Cancelled') {
        return false;
      }

      const existingStart = this.toDate(item.rentDate);
      const existingEnd = this.toDate(item.returnDate);

      if (!existingStart || !existingEnd) {
        return false;
      }

      return requestedStart <= existingEnd && requestedEnd >= existingStart;
    });

    return of({
      success: !overlapsExistingBooking,
      message: overlapsExistingBooking
        ? 'This car is already booked for one or more selected dates.'
        : 'Car is available for the selected dates.',
    });
  }

  updateRentalStatus(rentalId: number, status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'): Observable<ResponseModel> {
    this.rentals = this.rentals.map((booking) =>
      booking.rentalId === Number(rentalId) ? { ...booking, status } : booking
    );
    this.saveRentals();
    return of({ success: true, message: 'Booking status updated.' });
  }

  private loadRentals(): Rental[] {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveRentals(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.rentals));
  }

  private toDate(value?: Date | string): Date | undefined {
    if (!value) {
      return undefined;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
}
