import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BookingExtra } from '../models/booking-extra';
import { ListResponseModel } from '../models/listResponseModel';

@Injectable({ providedIn: 'root' })
export class BookingExtraService {
  private readonly extras: BookingExtra[] = [
    { extraId: 1, name: 'Basic insurance cover', description: 'Standard excess protection for everyday rentals.', price: 12, pricingType: 'perDay', category: 'Insurance' },
    { extraId: 2, name: 'Full insurance cover', description: 'Reduced excess, tyres, windscreen and extended accidental damage cover.', price: 24, pricingType: 'perDay', category: 'Insurance' },
    { extraId: 3, name: 'Additional driver', description: 'Add one extra named driver to the rental agreement.', price: 9, pricingType: 'perDay', category: 'Driver' },
    { extraId: 4, name: 'Child seat', description: 'Forward-facing child seat suitable for family journeys.', price: 35, pricingType: 'fixed', category: 'Equipment' },
    { extraId: 5, name: 'GPS navigation', description: 'Portable navigation unit with UK maps.', price: 7, pricingType: 'perDay', category: 'Equipment' },
    { extraId: 6, name: 'Roadside assistance plus', description: 'Priority support for breakdowns, tyre changes and lockouts.', price: 8, pricingType: 'perDay', category: 'Support' },
    { extraId: 7, name: 'Airport pickup / terminal meet-and-greet', description: 'Vehicle handover support at selected London airport terminals.', price: 45, pricingType: 'fixed', category: 'Pickup' },
    { extraId: 8, name: 'Fuel pre-purchase', description: 'Pre-pay a full fuel tank for a faster vehicle return.', price: 85, pricingType: 'fixed', category: 'Fuel' },
  ];

  getExtras(): Observable<ListResponseModel<BookingExtra>> {
    return of({ success: true, message: 'Booking extras loaded.', data: this.extras });
  }
}
