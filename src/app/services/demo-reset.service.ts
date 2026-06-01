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

  exportSnapshot(): { snapshot: DemoSnapshot; payload: string; filename: string } {
    const data: Record<string, unknown> = {};
    this.resetTargets.forEach((target) => {
      const raw = localStorage.getItem(target.key);
      if (raw === null) { return; }
      try {
        data[target.key] = JSON.parse(raw);
      } catch {
        data[target.key] = raw;
      }
    });
    const snapshot: DemoSnapshot = {
      version: 1,
      exportedAt: new Date().toISOString(),
      keys: data,
    };
    const payload = JSON.stringify(snapshot, null, 2);
    const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 13);
    const filename = `rent-a-car-demo-snapshot-${stamp}.json`;
    this.activityLogService.record('Demo snapshot exported', 'System', `Exported ${Object.keys(data).length} localStorage keys to ${filename}.`, { entityReference: filename, severity: 'Info' });
    return { snapshot, payload, filename };
  }

  importSnapshot(payload: string): Observable<ResponseModel> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return of({ success: false, message: 'Snapshot file is not valid JSON.' });
    }
    if (!this.isSnapshot(parsed)) {
      return of({ success: false, message: 'Snapshot file is not in the expected format.' });
    }
    const snapshot: DemoSnapshot = parsed;
    const knownKeys = new Set(this.resetTargets.map((target) => target.key));
    let applied = 0;
    Object.keys(snapshot.keys).forEach((key) => {
      if (!knownKeys.has(key)) { return; }
      const value = snapshot.keys[key];
      const serialised = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialised);
      applied += 1;
    });
    this.activityLogService.record('Demo snapshot imported', 'System', `Imported ${applied} localStorage keys from snapshot (exported ${snapshot.exportedAt}).`, { severity: 'Warning' });
    return of({ success: true, message: `Snapshot imported. ${applied} keys restored. Refresh the page to see the new state.` });
  }

  private isSnapshot(value: unknown): value is DemoSnapshot {
    if (!value || typeof value !== 'object') { return false; }
    const candidate = value as Partial<DemoSnapshot>;
    return typeof candidate.version === 'number' && typeof candidate.exportedAt === 'string' && !!candidate.keys && typeof candidate.keys === 'object';
  }
}

export interface DemoSnapshot {
  version: number;
  exportedAt: string;
  keys: Record<string, unknown>;
}
