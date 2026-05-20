import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ResponseModel } from '../models/responseModel';
import { ActivityLogService } from './activity-log.service';
import { BookingExtraService } from './booking-extra.service';

export interface DemoStorageKey {
  key: string;
  label: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class DemoResetService {
  readonly resetTargets: DemoStorageKey[] = [
    { key: 'rent-a-car-demo-rentals', label: 'Bookings', description: 'Clears local booking history and status workflow data.' },
    { key: 'rent-a-car-demo-payments', label: 'Payments', description: 'Clears mock Card, PayPal and Apple Pay payment records.' },
    { key: 'rent-a-car-demo-customers', label: 'Customers', description: 'Clears locally registered customer accounts.' },
    { key: 'rent-a-car-demo-current-customer', label: 'Customer session', description: 'Signs out the current local customer.' },
    { key: 'rent-a-car-demo-admin-session', label: 'Admin session', description: 'Signs out the current demo admin.' },
    { key: 'rent-a-car-demo-booking-extras', label: 'Extras', description: 'Clears custom extras. Use Restore demo extras to rebuild defaults.' },
    { key: 'rent-a-car-demo-cars', label: 'Cars', description: 'Clears local edited vehicle catalogue data.' },
    { key: 'rent-a-car-demo-brands', label: 'Brands', description: 'Clears local edited brand catalogue data.' },
    { key: 'rent-a-car-demo-colors', label: 'Colours', description: 'Clears local edited colour catalogue data.' },
    { key: 'rentacar-featured-car-id', label: 'Featured vehicle memory', description: 'Clears the previous featured vehicle ID.' },
  ];

  constructor(private activityLogService: ActivityLogService, private bookingExtraService: BookingExtraService) {}

  resetKey(key: string, label?: string): Observable<ResponseModel> {
    localStorage.removeItem(key);
    this.activityLogService.record('Demo data reset', 'System', `${label || key} was cleared from localStorage.`, { entityReference: key, severity: 'Warning' });
    return of({ success: true, message: `${label || key} cleared.` });
  }

  resetBookingsAndPayments(): Observable<ResponseModel> {
    localStorage.removeItem('rent-a-car-demo-rentals');
    localStorage.removeItem('rent-a-car-demo-payments');
    this.activityLogService.record('Bookings and payments reset', 'System', 'Booking and payment demo records were cleared.', { severity: 'Warning' });
    return of({ success: true, message: 'Bookings and payments cleared.' });
  }

  resetAll(): Observable<ResponseModel> {
    this.resetTargets.forEach((target) => localStorage.removeItem(target.key));
    this.activityLogService.record('Full demo reset', 'System', 'All configured localStorage demo keys were cleared.', { severity: 'Danger' });
    return of({ success: true, message: 'All configured demo data cleared.' });
  }

  restoreDemoExtras(): Observable<ResponseModel> {
    this.bookingExtraService.resetDemoExtras().subscribe();
    this.activityLogService.record('Demo extras restored', 'Extra', 'Default demo booking extras were restored.', { severity: 'Success' });
    return of({ success: true, message: 'Demo extras restored.' });
  }
}
