import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Payment, PaymentMethod, PaymentStatus } from '../models/payment';
import { ResponseModel } from '../models/responseModel';
import { ActivityLogService } from './activity-log.service';
import { CustomerActivityService } from './customer-activity.service';
import { RewardService } from './reward.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly storageKey = 'rent-a-car-demo-payments';
  private payments: Payment[] = this.loadPayments();

  constructor(private activityLogService: ActivityLogService, private customerActivityService: CustomerActivityService, private rewardService: RewardService) {}

  getPayments(): Observable<ListResponseModel<Payment>> {
    return of({ success: true, message: 'Payments loaded.', data: this.payments });
  }

  getPaymentByBookingReference(reference: string): Observable<ListResponseModel<Payment>> {
    const normalisedReference = this.normalise(reference);
    const matches = this.payments.filter((payment) => this.normalise(payment.bookingReference) === normalisedReference);
    return of({ success: matches.length > 0, message: matches.length ? 'Payment found.' : 'No payment found.', data: matches });
  }

  createPayment(input: { bookingReference: string; method: PaymentMethod; amount: number; grossAmount?: number; discountCode?: string; discountAmount?: number; rewardDiscountAmount?: number; customerEmail?: string; cardholderName?: string; cardNumber?: string; billingPostcode?: string; }): Observable<ListResponseModel<Payment>> {
    const now = new Date().toISOString();
    const payment: Payment = {
      paymentId: Math.max(...this.payments.map((item) => item.paymentId || 0), 0) + 1,
      bookingReference: input.bookingReference,
      method: input.method,
      amount: Number(input.amount || 0),
      grossAmount: Number(input.grossAmount || input.amount || 0),
      discountCode: input.discountCode,
      discountAmount: Number(input.discountAmount || 0),
      rewardDiscountAmount: Number(input.rewardDiscountAmount || 0),
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
    this.activityLogService.record('Payment completed', 'Payment', `${input.method} payment recorded for booking ${input.bookingReference}.`, { entityReference: payment.transactionReference, severity: 'Success' });
    if (input.customerEmail) {
      this.customerActivityService.record(input.customerEmail, 'PaymentCompleted', `Payment completed for booking ${input.bookingReference}.`, { entityReference: payment.transactionReference, metadata: { amount: payment.amount, method: payment.method } });
      this.rewardService.earnForBooking(input.customerEmail, input.bookingReference, payment.amount);
    }
    return of({ success: true, message: 'Mock payment completed.', data: [payment] });
  }

  updatePaymentStatus(transactionReference: string, status: PaymentStatus): Observable<ResponseModel> {
    let updated: Payment | undefined;
    this.payments = this.payments.map((payment) => {
      if (payment.transactionReference !== transactionReference) { return payment; }
      updated = { ...payment, status, updatedAt: new Date().toISOString() };
      return updated;
    });
    this.savePayments();
    if (updated) {
      this.activityLogService.record('Payment status changed', 'Payment', `Payment ${transactionReference} changed to ${status}.`, { entityReference: transactionReference, severity: status === 'Refunded' ? 'Warning' : 'Info' });
      if (status === 'Refunded') {
        this.customerActivityService.record(updated.bookingReference, 'RefundIssued', `Refund issued for payment ${transactionReference}.`, { entityReference: transactionReference });
      }
    }
    return of({ success: !!updated, message: updated ? 'Payment status updated.' : 'Payment not found.' });
  }

  updatePaymentStatusByBookingReference(bookingReference: string, status: PaymentStatus): Observable<ListResponseModel<Payment>> {
    const normalisedReference = this.normalise(bookingReference);
    let updatedPayment: Payment | undefined;
    this.payments = this.payments.map((payment) => {
      if (this.normalise(payment.bookingReference) !== normalisedReference) { return payment; }
      updatedPayment = { ...payment, status, updatedAt: new Date().toISOString() };
      return updatedPayment;
    });
    this.savePayments();
    if (updatedPayment) {
      this.activityLogService.record('Payment status changed', 'Payment', `Booking ${bookingReference} payment changed to ${status}.`, { entityReference: updatedPayment.transactionReference, severity: status === 'Refunded' ? 'Warning' : 'Info' });
    }
    return of({ success: !!updatedPayment, message: updatedPayment ? 'Payment status updated.' : 'Payment not found.', data: updatedPayment ? [updatedPayment] : [] });
  }

  refundPaymentByBookingReference(bookingReference: string): Observable<ListResponseModel<Payment>> {
    return this.updatePaymentStatusByBookingReference(bookingReference, 'Refunded');
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
    } catch { return []; }
  }

  private savePayments(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.payments));
  }

  private normalise(value: string): string {
    return (value || '').trim().toLowerCase();
  }
}
