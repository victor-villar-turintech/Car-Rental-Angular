import { Component, OnInit } from '@angular/core';
import { Rental, RentalStatus } from 'src/app/models/rental';
import { PaymentService } from 'src/app/services/payment.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({ selector: 'app-admin-bookings', templateUrl: './bookings-dashboard.component.html', styleUrls: ['./bookings-dashboard.component.css'] })
export class AdminBookingsComponent implements OnInit {
  bookings: Rental[] = [];
  statusFilter = '';

  constructor(private rentalService: RentalService, private paymentService: PaymentService) {}

  ngOnInit(): void { this.loadBookings(); }

  get filteredBookings(): Rental[] {
    const bookings = this.statusFilter ? this.bookings.filter((booking) => booking.status === this.statusFilter) : this.bookings;
    return [...bookings].sort((a, b) => {
      const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return right - left;
    });
  }

  loadBookings(): void { this.rentalService.getRental().subscribe((response) => this.bookings = response.data); }

  updateStatus(booking: Rental, status: RentalStatus): void {
    if (!booking.rentalId || !this.canMoveToStatus(booking, status)) { return; }

    this.rentalService.updateRentalStatus(booking.rentalId, status).subscribe(() => {
      if (status === 'Cancelled' && booking.paymentStatus === 'Paid' && booking.bookingReference) {
        this.paymentService.refundPaymentByBookingReference(booking.bookingReference).subscribe((response) => {
          const payment = response.data[0];
          this.rentalService.updateBookingPayment(booking.bookingReference || '', {
            paymentStatus: 'Refunded',
            paymentMethod: payment?.method || booking.paymentMethod,
            paymentReference: payment?.transactionReference || booking.paymentReference,
            paidAt: booking.paidAt,
          }).subscribe(() => this.loadBookings());
        });
        return;
      }
      this.loadBookings();
    });
  }

  getAvailableActions(booking: Rental): RentalStatus[] {
    switch (booking.status) {
      case 'Pending': return ['Confirmed', 'Cancelled'];
      case 'Confirmed': return ['Active', 'Cancelled'];
      case 'Active': return ['Completed'];
      default: return [];
    }
  }

  getActionLabel(status: RentalStatus): string {
    const labels: { [key: string]: string } = { Confirmed: 'Confirm', Active: 'Mark active', Completed: 'Complete', Cancelled: 'Cancel / refund' };
    return labels[status] || status;
  }

  canMoveToStatus(booking: Rental, status: RentalStatus): boolean { return this.getAvailableActions(booking).includes(status); }

  totalRevenue(): number {
    return this.bookings.filter((booking) => booking.status !== 'Cancelled').reduce((total, booking) => total + Number(booking.totalRentPrice || 0), 0);
  }

  countByStatus(status: RentalStatus): number { return this.bookings.filter((booking) => booking.status === status).length; }
}
