import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BookingExtra, BookingExtraCategory, BookingExtraPricingType } from '../models/booking-extra';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { ActivityLogService } from './activity-log.service';

@Injectable({ providedIn: 'root' })
export class BookingExtraService {
  private readonly storageKey = 'rent-a-car-demo-booking-extras';
  private extras: BookingExtra[] = this.loadExtras();

  constructor(private activityLogService: ActivityLogService) {}

  getExtras(): Observable<ListResponseModel<BookingExtra>> {
    return of({ success: true, message: 'Booking extras loaded.', data: this.extras.filter((extra) => extra.enabled !== false) });
  }

  getAllExtras(): Observable<ListResponseModel<BookingExtra>> {
    return of({ success: true, message: 'All booking extras loaded.', data: this.extras });
  }

  addExtra(input: Omit<BookingExtra, 'extraId' | 'createdAt' | 'updatedAt'>): Observable<ResponseModel> {
    const now = new Date().toISOString();
    const extra: BookingExtra = { ...input, extraId: Math.max(...this.extras.map((item) => item.extraId || 0), 0) + 1, name: input.name.trim(), description: input.description.trim(), price: Number(input.price || 0), enabled: input.enabled !== false, createdAt: now, updatedAt: now };
    this.extras = [...this.extras, extra];
    this.saveExtras();
    this.activityLogService.record('Extra added', 'Extra', `${extra.name} was added to booking extras.`, { entityReference: String(extra.extraId), severity: 'Success' });
    return of({ success: true, message: 'Extra added.' });
  }

  updateExtra(extra: BookingExtra): Observable<ResponseModel> {
    const now = new Date().toISOString();
    this.extras = this.extras.map((item) => item.extraId === Number(extra.extraId) ? { ...item, ...extra, name: extra.name.trim(), description: extra.description.trim(), price: Number(extra.price || 0), updatedAt: now } : item);
    this.saveExtras();
    this.activityLogService.record('Extra updated', 'Extra', `${extra.name} was updated.`, { entityReference: String(extra.extraId), severity: 'Info' });
    return of({ success: true, message: 'Extra updated.' });
  }

  deleteExtra(extraId: number): Observable<ResponseModel> {
    const extra = this.extras.find((item) => item.extraId === Number(extraId));
    this.extras = this.extras.filter((item) => item.extraId !== Number(extraId));
    this.saveExtras();
    this.activityLogService.record('Extra deleted', 'Extra', `${extra?.name || 'Extra'} was deleted.`, { entityReference: String(extraId), severity: 'Warning' });
    return of({ success: true, message: 'Extra deleted.' });
  }

  toggleExtra(extraId: number): Observable<ResponseModel> {
    let changed: BookingExtra | undefined;
    this.extras = this.extras.map((extra) => {
      if (extra.extraId !== Number(extraId)) {
        return extra;
      }
      changed = { ...extra, enabled: extra.enabled === false, updatedAt: new Date().toISOString() };
      return changed;
    });
    this.saveExtras();
    this.activityLogService.record('Extra availability changed', 'Extra', `${changed?.name || 'Extra'} is now ${changed?.enabled === false ? 'disabled' : 'enabled'}.`, { entityReference: String(extraId), severity: 'Info' });
    return of({ success: true, message: 'Extra status updated.' });
  }

  resetDemoExtras(): Observable<ResponseModel> {
    this.extras = this.defaultExtras();
    this.saveExtras();
    this.activityLogService.record('Demo extras reset', 'Extra', 'Default demo booking extras were restored.', { severity: 'Success' });
    return of({ success: true, message: 'Demo extras restored.' });
  }

  private loadExtras(): BookingExtra[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      const defaults = this.defaultExtras();
      localStorage.setItem(this.storageKey, JSON.stringify(defaults));
      return defaults;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return this.defaultExtras();
      }
      return parsed.map((extra) => this.normaliseExtra(extra));
    } catch {
      return this.defaultExtras();
    }
  }

  private saveExtras(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.extras));
  }

  private normaliseExtra(extra: Partial<BookingExtra>): BookingExtra {
    return { extraId: Number(extra.extraId || 0), name: String(extra.name || 'Extra'), description: String(extra.description || ''), price: Number(extra.price || 0), pricingType: (extra.pricingType || 'fixed') as BookingExtraPricingType, category: (extra.category || 'Other') as BookingExtraCategory, enabled: extra.enabled !== false, createdAt: extra.createdAt, updatedAt: extra.updatedAt };
  }

  private defaultExtras(): BookingExtra[] {
    const now = new Date().toISOString();
    return [
      { extraId: 1, name: 'Basic insurance cover', description: 'Standard excess protection for everyday rentals.', price: 12, pricingType: 'perDay', category: 'Insurance', enabled: true, createdAt: now, updatedAt: now },
      { extraId: 2, name: 'Full insurance cover', description: 'Reduced excess, tyres, windscreen and extended accidental damage cover.', price: 24, pricingType: 'perDay', category: 'Insurance', enabled: true, createdAt: now, updatedAt: now },
      { extraId: 3, name: 'Additional driver', description: 'Add one extra named driver to the rental agreement.', price: 9, pricingType: 'perDay', category: 'Driver', enabled: true, createdAt: now, updatedAt: now },
      { extraId: 4, name: 'Child seat', description: 'Forward-facing child seat suitable for family journeys.', price: 35, pricingType: 'fixed', category: 'Equipment', enabled: true, createdAt: now, updatedAt: now },
      { extraId: 5, name: 'GPS navigation', description: 'Portable navigation unit with UK maps.', price: 7, pricingType: 'perDay', category: 'Equipment', enabled: true, createdAt: now, updatedAt: now },
      { extraId: 6, name: 'Roadside assistance plus', description: 'Priority support for breakdowns, tyre changes and lockouts.', price: 8, pricingType: 'perDay', category: 'Support', enabled: true, createdAt: now, updatedAt: now },
      { extraId: 7, name: 'Airport pickup / terminal meet-and-greet', description: 'Vehicle handover support at selected London airport terminals.', price: 45, pricingType: 'fixed', category: 'Pickup', enabled: true, createdAt: now, updatedAt: now },
      { extraId: 8, name: 'Fuel pre-purchase', description: 'Pre-pay a full fuel tank for a faster vehicle return.', price: 85, pricingType: 'fixed', category: 'Fuel', enabled: true, createdAt: now, updatedAt: now },
    ];
  }
}
