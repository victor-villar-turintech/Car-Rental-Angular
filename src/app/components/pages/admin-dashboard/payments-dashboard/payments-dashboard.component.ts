import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Payment, PaymentMethod, PaymentStatus } from 'src/app/models/payment';
import { Rental } from 'src/app/models/rental';
import { PaymentService } from 'src/app/services/payment.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-admin-payments',
  templateUrl: './payments-dashboard.component.html',
  styleUrls: ['./payments-dashboard.component.css'],
})
export class AdminPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  bookings: Rental[] = [];
  statusFilter = '';
  methodFilter = '';
  fromDate = '';
  toDate = '';
  searchText = '';
  readonly methods: PaymentMethod[] = ['Card', 'PayPal', 'ApplePay'];

  constructor(
    private paymentService: PaymentService,
    private rentalService: RentalService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void { this.loadData(); }

  get filteredPayments(): Payment[] {
    const term = this.searchText.trim().toLowerCase();
    const fromTime = this.fromDate ? new Date(this.fromDate).getTime() : undefined;
    const toTime = this.toDate ? new Date(this.toDate + 'T23:59:59').getTime() : undefined;

    return [...this.payments]
      .filter((payment) => !this.statusFilter || payment.status === this.statusFilter)
      .filter((payment) => !this.methodFilter || payment.method === this.methodFilter)
      .filter((payment) => {
        if (fromTime === undefined && toTime === undefined) { return true; }
        const created = new Date(payment.createdAt).getTime();
        if (fromTime !== undefined && created < fromTime) { return false; }
        if (toTime !== undefined && created > toTime) { return false; }
        return true;
      })
      .filter((payment) => {
        if (!term) { return true; }
        const booking = this.getBooking(payment);
        const haystack = `${payment.transactionReference} ${payment.bookingReference} ${booking?.customerName || ''} ${booking?.customerEmail || ''}`.toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  get paidTotal(): number {
    return this.filteredPayments.filter((payment) => payment.status === 'Paid').reduce((total, payment) => total + Number(payment.amount || 0), 0);
  }

  get refundedTotal(): number {
    return this.filteredPayments.filter((payment) => payment.status === 'Refunded').reduce((total, payment) => total + Number(payment.amount || 0), 0);
  }

  get pendingTotal(): number {
    return this.filteredPayments.filter((payment) => payment.status === 'Pending').reduce((total, payment) => total + Number(payment.amount || 0), 0);
  }

  loadData(): void {
    this.paymentService.getPayments().subscribe((response) => this.payments = response.data);
    this.rentalService.getRental().subscribe((response) => this.bookings = response.data);
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.methodFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.searchText = '';
  }

  updateStatus(payment: Payment, status: PaymentStatus): void {
    this.paymentService.updatePaymentStatus(payment.transactionReference, status).subscribe((response) => {
      if (response.success) {
        this.rentalService.updateBookingPayment(payment.bookingReference, {
          paymentStatus: status,
          paymentMethod: payment.method,
          paymentReference: payment.transactionReference,
          paidAt: status === 'Paid' ? (payment.updatedAt || payment.createdAt) : payment.createdAt,
        }).subscribe(() => {
          this.toastrService.success(response.message);
          this.loadData();
        });
      }
    });
  }

  getBooking(payment: Payment): Rental | undefined {
    return this.bookings.find((booking) => (booking.bookingReference || '').toLowerCase() === payment.bookingReference.toLowerCase());
  }
}
