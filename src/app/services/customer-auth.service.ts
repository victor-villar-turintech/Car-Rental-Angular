import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Customer, CustomerSession } from '../models/customer';
import { ResponseModel } from '../models/responseModel';

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {
  private readonly customersKey = 'rent-a-car-demo-customers';
  private readonly sessionKey = 'rent-a-car-demo-customer-session';
  private customers: Customer[] = this.loadCustomers();

  register(customer: Omit<Customer, 'customerId' | 'createdAt'>): Observable<ResponseModel> {
    const email = this.normalise(customer.email);

    if (this.customers.some((item) => this.normalise(item.email) === email)) {
      return of({ success: false, message: 'An account already exists for this email.' });
    }

    const now = new Date().toISOString();
    const savedCustomer: Customer = {
      ...customer,
      email,
      customerId: Math.max(...this.customers.map((item) => item.customerId || 0), 0) + 1,
      createdAt: now,
      updatedAt: now,
    };

    this.customers = [...this.customers, savedCustomer];
    this.saveCustomers();
    this.setSession(savedCustomer);
    return of({ success: true, message: 'Account created and signed in locally.' });
  }

  login(email: string, password: string): Observable<ResponseModel> {
    const customer = this.customers.find((item) => this.normalise(item.email) === this.normalise(email));

    if (!customer || customer.password !== password) {
      return of({ success: false, message: 'Invalid email or password.' });
    }

    this.setSession(customer);
    return of({ success: true, message: 'Signed in locally.' });
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }

  getCurrentSession(): CustomerSession | undefined {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) {
      return undefined;
    }

    try {
      return JSON.parse(raw) as CustomerSession;
    } catch {
      localStorage.removeItem(this.sessionKey);
      return undefined;
    }
  }

  getCurrentCustomer(): Customer | undefined {
    const session = this.getCurrentSession();
    if (!session) {
      return undefined;
    }
    return this.customers.find((customer) => customer.customerId === session.customerId);
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentSession();
  }

  updateCurrentCustomer(details: Pick<Customer, 'firstName' | 'lastName' | 'phone'>): Observable<ResponseModel> {
    const session = this.getCurrentSession();
    if (!session) {
      return of({ success: false, message: 'You must be signed in.' });
    }

    this.customers = this.customers.map((customer) =>
      customer.customerId === session.customerId
        ? { ...customer, ...details, updatedAt: new Date().toISOString() }
        : customer
    );
    this.saveCustomers();

    const updated = this.getCurrentCustomer();
    if (updated) {
      this.setSession(updated);
    }

    return of({ success: true, message: 'Account details updated locally.' });
  }

  private setSession(customer: Customer): void {
    const session: CustomerSession = {
      customerId: customer.customerId,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  private loadCustomers(): Customer[] {
    const raw = localStorage.getItem(this.customersKey);
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

  private saveCustomers(): void {
    localStorage.setItem(this.customersKey, JSON.stringify(this.customers));
  }

  private normalise(value: string): string {
    return (value || '').trim().toLowerCase();
  }
}
