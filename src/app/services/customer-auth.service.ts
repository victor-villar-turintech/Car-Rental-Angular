import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Customer, CustomerSession } from '../models/customer';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { CustomerActivityService } from './customer-activity.service';
import { BackendAuthService, AuthResponse, BackendUser } from './backend-auth.service';

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {
  private readonly customersKey = 'rent-a-car-demo-customers';
  private readonly sessionKey = 'rent-a-car-demo-customer-session';
  private customers: Customer[] = this.loadCustomers();

  constructor(
    private customerActivityService: CustomerActivityService,
    private backendAuth: BackendAuthService,
  ) {}

  register(customer: Omit<Customer, 'customerId' | 'createdAt'>): Observable<ResponseModel> {
    const email = this.normalise(customer.email);

    if (this.backendAuth.enabled) {
      return this.backendAuth
        .register({
          email,
          password: customer.password,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
        })
        .pipe(
          map((auth: AuthResponse) => {
            this.backendAuth.persistSession(auth);
            const projected = this.projectBackendUser(auth.user, customer.password);
            this.upsertCachedCustomer(projected);
            this.setSession(projected);
            this.customerActivityService.record(email, 'Registered', 'Customer registered via the NestJS backend.', { customerId: projected.customerId });
            return { success: true, message: 'Account created and signed in via the backend.' } as ResponseModel;
          }),
          catchError((err) => of({ success: false, message: this.describeHttpError(err, 'Registration failed.') } as ResponseModel)),
        );
    }

    if (this.customers.some((item) => this.normalise(item.email) === email)) {
      return of({ success: false, message: 'An account already exists for this email.' });
    }

    const now = new Date().toISOString();
    const savedCustomer: Customer = {
      ...customer,
      email,
      isDisabled: false,
      customerId: Math.max(...this.customers.map((item) => item.customerId || 0), 0) + 1,
      createdAt: now,
      updatedAt: now,
    };

    this.customers = [...this.customers, savedCustomer];
    this.saveCustomers();
    this.setSession(savedCustomer);
    this.customerActivityService.record(email, 'Registered', 'Customer registered a local demo account.', { customerId: savedCustomer.customerId });
    return of({ success: true, message: 'Account created and signed in locally.' });
  }

  login(email: string, password: string): Observable<ResponseModel> {
    if (this.backendAuth.enabled) {
      return this.backendAuth.login(this.normalise(email), password).pipe(
        map((auth: AuthResponse) => {
          this.backendAuth.persistSession(auth);
          const projected = this.projectBackendUser(auth.user, password);
          this.upsertCachedCustomer(projected);
          this.setSession(projected);
          this.customerActivityService.record(projected.email, 'LoggedIn', 'Customer logged in via the NestJS backend.', { customerId: projected.customerId });
          return { success: true, message: 'Signed in via the backend.' } as ResponseModel;
        }),
        catchError((err) => of({ success: false, message: this.describeHttpError(err, 'Invalid email or password.') } as ResponseModel)),
      );
    }

    const customer = this.customers.find((item) => this.normalise(item.email) === this.normalise(email));

    if (!customer || customer.password !== password) {
      return of({ success: false, message: 'Invalid email or password.' });
    }
    if (customer.isDisabled) {
      return of({ success: false, message: 'This demo customer account is disabled.' });
    }

    this.setSession(customer);
    this.customerActivityService.record(customer.email, 'LoggedIn', 'Customer logged in.', { customerId: customer.customerId });
    return of({ success: true, message: 'Signed in locally.' });
  }

  private projectBackendUser(user: BackendUser, password: string): Customer {
    const numericId = Math.abs(this.hashString(user.id)) % 100000 + 1;
    return {
      customerId: numericId,
      email: user.email,
      password,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      rewardPoints: user.rewardPoints || 0,
      isDisabled: !user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as Customer;
  }

  private upsertCachedCustomer(customer: Customer): void {
    const existingIndex = this.customers.findIndex((c) => this.normalise(c.email) === this.normalise(customer.email));
    if (existingIndex >= 0) {
      this.customers = [...this.customers.slice(0, existingIndex), { ...this.customers[existingIndex], ...customer }, ...this.customers.slice(existingIndex + 1)];
    } else {
      this.customers = [...this.customers, customer];
    }
    this.saveCustomers();
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  private describeHttpError(err: any, fallback: string): string {
    if (err && err.error && typeof err.error.message === 'string') { return err.error.message; }
    if (err && err.error && Array.isArray(err.error.message) && err.error.message.length > 0) {
      return err.error.message[0];
    }
    if (err && err.message) { return err.message; }
    return fallback;
  }

  logout(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.customerActivityService.record(session.email, 'LoggedOut', 'Customer logged out.', { customerId: session.customerId });
    }
    localStorage.removeItem(this.sessionKey);
    if (this.backendAuth.enabled) {
      this.backendAuth.clearSession();
    }
  }

  getCustomers(): Observable<ListResponseModel<Customer>> {
    return of({ success: true, message: 'Customers loaded.', data: this.customers });
  }

  generateResetLink(email: string): Observable<ListResponseModel<Customer>> {
    const normalised = this.normalise(email);
    let updated: Customer | undefined;
    const token = this.createResetToken(normalised);
    this.customers = this.customers.map((customer) => {
      if (this.normalise(customer.email) !== normalised) { return customer; }
      updated = { ...customer, resetToken: token, resetTokenCreatedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      return updated;
    });
    this.saveCustomers();
    if (updated) {
      this.customerActivityService.record(normalised, 'PasswordResetRequested', `Admin generated a mock reset password link for ${normalised}.`, { customerId: updated.customerId, entityReference: token });
    }
    return of({ success: !!updated, message: updated ? 'Mock reset link generated.' : 'Customer not found.', data: updated ? [updated] : [] });
  }

  setCustomerDisabled(email: string, disabled: boolean): Observable<ResponseModel> {
    const normalised = this.normalise(email);
    let updated = false;
    this.customers = this.customers.map((customer) => {
      if (this.normalise(customer.email) !== normalised) { return customer; }
      updated = true;
      return { ...customer, isDisabled: disabled, updatedAt: new Date().toISOString() };
    });
    this.saveCustomers();
    return of({ success: updated, message: updated ? `Customer ${disabled ? 'disabled' : 'enabled'}.` : 'Customer not found.' });
  }

  getCurrentSession(): CustomerSession | undefined {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) { return undefined; }
    try {
      return JSON.parse(raw) as CustomerSession;
    } catch {
      localStorage.removeItem(this.sessionKey);
      return undefined;
    }
  }

  getCurrentCustomer(): Customer | undefined {
    const session = this.getCurrentSession();
    if (!session) { return undefined; }
    return this.customers.find((customer) => customer.customerId === session.customerId && !customer.isDisabled);
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
      this.customerActivityService.record(updated.email, 'ProfileUpdated', 'Customer updated profile details.', { customerId: updated.customerId });
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

  private createResetToken(email: string): string {
    const source = `${email}|${Date.now()}`;
    let hash = 2166136261;
    for (let index = 0; index < source.length; index++) {
      hash ^= source.charCodeAt(index);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return `RST-${Math.abs(hash >>> 0).toString(36).toUpperCase().padStart(8, '0')}`;
  }

  private loadCustomers(): Customer[] {
    const raw = localStorage.getItem(this.customersKey);
    if (!raw) { return []; }
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
