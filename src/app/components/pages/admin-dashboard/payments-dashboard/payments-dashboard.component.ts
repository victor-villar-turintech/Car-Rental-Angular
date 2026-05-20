import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Payment, PaymentStatus } from 'src/app/models/payment';
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

  constructor(
    private paymentService: PaymentService,
    private rentalService: RentalService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void { this.loadData(); }

  get filteredPayments(): Payment[] {
    const rows = this.statusFilter ? this.payments.filter((payment) => payment.status === this.statusFilter) : this.payments;
    return [...rows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  get paidTotal(): number {
    return this.payments.filter((payment) => payment.status === 'Paid').reduce((total, payment) => total + Number(payment.amount || 0), 0);
  }

  get refundedTotal(): number {
    return this.payments.filter((payment) => payment.status === 'Refunded').reduce((total, payment) => total + Number(payment.amount || 0), 0);
  }

  loadData(): void {
    this.paymentService.getPayments().subscribe((response) => this.payments = response.data);
    this.rentalService.getRental().subscribe((response) => this.bookings = response.data);
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
