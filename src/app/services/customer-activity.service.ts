import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CustomerActivity, CustomerActivityType } from '../models/customer-activity';
import { ListResponseModel } from '../models/listResponseModel';

@Injectable({ providedIn: 'root' })
export class CustomerActivityService {
  private readonly storageKey = 'rent-a-car-demo-customer-activity';
  private activity: CustomerActivity[] = this.loadActivity();

  record(customerEmail: string, activityType: CustomerActivityType, message: string, options?: { customerId?: number; entityReference?: string; metadata?: any }): void {
    if (!customerEmail) { return; }
    const entry: CustomerActivity = {
      activityId: Math.max(...this.activity.map((item) => item.activityId || 0), 0) + 1,
      customerId: options?.customerId,
      customerEmail: this.normalise(customerEmail),
      activityType,
      message,
      entityReference: options?.entityReference,
      metadata: options?.metadata,
      createdAt: new Date().toISOString(),
    };
    this.activity = [entry, ...this.activity].slice(0, 500);
    this.saveActivity();
  }

  getActivity(): Observable<ListResponseModel<CustomerActivity>> {
    return of({ success: true, message: 'Customer activity loaded.', data: this.activity });
  }

  getActivityForCustomer(email: string): Observable<ListResponseModel<CustomerActivity>> {
    const normalised = this.normalise(email);
    return of({ success: true, message: 'Customer activity loaded.', data: this.activity.filter((item) => this.normalise(item.customerEmail) === normalised) });
  }

  clear(): void {
    this.activity = [];
    this.saveActivity();
  }

  private loadActivity(): CustomerActivity[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) { return []; }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveActivity(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.activity));
  }

  private normalise(value: string): string {
    return (value || '').trim().toLowerCase();
  }
}
