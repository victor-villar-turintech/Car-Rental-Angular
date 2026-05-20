import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Payment, PaymentMethod, PaymentStatus } from '../models/payment';
import { ResponseModel } from '../models/responseModel';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly storageKey = 'rent-a-car-demo-payments';
  private payments: Payment[] = this.loadPayments();

  getPayments(): Observable<ListResponseModel<Payment>> {
    return of({ success: true, message: 'Payments loaded.', data: this.payments });
  }

  getPaymentByBookingReference(reference: string): Observable<ListResponseModel<Payment>> {
    const normalisedReference = this.normalise(reference);
    const matches = this.payments.filter((payment) => this.normalise(payment.bookingReference) === normalisedReference);
    return of({ success: matches.length > 0, message: matches.length ? 'Payment found.' : 'No payment found.', data: matches });
  }

  createPayment(input: {
    bookingReference: string;
    method: PaymentMethod;
    amount: number;
    cardholderName?: string;
    cardNumber?: string;
    billingPostcode?: string;
  }): Observable<ListResponseModel<Payment>> {
    const now = new Date().toISOString();
    const payment: Payment = {
      paymentId: Math.max(...this.payments.map((item) => item.paymentId || 0), 0) + 1,
      bookingReference: input.bookingReference,
      method: input.method,
      amount: Number(input.amount || 0),
      currency: 'GBP',
      status: 'Paid',
      transactionReference: this.createTransactionReference(input.bookingReference, input.method, now),
      cardholderName: input.cardholderName,
      cardLastFour: input.cardNumber ? input.cardNumber.replace(/\D/g, '').slice(-4) : undefined,
      billingPostcode: input.billingPostcode,
      createdAt: now,
      updatedAt: now,
    };

    this.payments = [...this.payments.filter((item) => this.normalise(item.bookingReference) !== this.normalise(input.bookingReference)), payment];
    this.savePayments();
    return of({ success: true, message: 'Mock payment completed.', data: [payment] });
  }

  updatePaymentStatus(transactionReference: string, status: PaymentStatus): Observable<ResponseModel> {
    this.payments = this.payments.map((payment) =>
      payment.transactionReference === transactionReference ? { ...payment, status, updatedAt: new Date().toISOString() } : payment
    );
    this.savePayments();
    return of({ success: true, message: 'Payment status updated.' });
  }

  private createTransactionReference(bookingReference: string, method: PaymentMethod, entropy: string): string {
    const source = `${bookingReference}|${method}|${entropy}`;
    let hash = 2166136261;
    for (let index = 0; index < source.length; index++) {
      hash ^= source.charCodeAt(index);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return `PAY-${method.toUpperCase()}-${Math.abs(hash >>> 0).toString(36).toUpperCase().padStart(8, '0')}`;
  }

  private loadPayments(): Payment[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) { return []; }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private savePayments(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.payments));
  }

  private normalise(value: string): string {
    return (value || '').trim().toLowerCase();
  }
}
