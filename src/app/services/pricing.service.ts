import { Injectable } from '@angular/core';
import { BookingExtraSelection } from '../models/booking-extra';

@Injectable({ providedIn: 'root' })
export class PricingService {
  calculateRentalDays(startDate?: string | Date, endDate?: string | Date): number {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = this.toDate(startDate);
    const end = this.toDate(endDate);

    if (!start || !end || end < start) {
      return 0;
    }

    const dayMs = 24 * 60 * 60 * 1000;
    return Math.ceil((end.getTime() - start.getTime()) / dayMs) + 1;
  }

  calculateVehicleSubtotal(dailyPrice: number, rentalDays: number): number {
    return Math.max(0, Number(dailyPrice || 0)) * Math.max(0, Number(rentalDays || 0));
  }

  calculateExtrasSubtotal(extras: BookingExtraSelection[] = [], rentalDays = 0): number {
    return extras
      .filter((extra) => extra.selected)
      .reduce((total, extra) => total + this.calculateExtraTotal(extra, rentalDays), 0);
  }

  calculateExtraTotal(extra: BookingExtraSelection, rentalDays: number): number {
    const quantity = Math.max(1, Number(extra.quantity || 1));
    const price = Math.max(0, Number(extra.price || 0));
    const durationMultiplier = extra.pricingType === 'perDay' ? Math.max(1, Number(rentalDays || 1)) : 1;
    return price * durationMultiplier * quantity;
  }

  calculateGrandTotal(dailyPrice: number, rentalDays: number, extras: BookingExtraSelection[] = []): number {
    return this.calculateVehicleSubtotal(dailyPrice, rentalDays) + this.calculateExtrasSubtotal(extras, rentalDays);
  }

  private toDate(value: string | Date): Date | undefined {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
}
