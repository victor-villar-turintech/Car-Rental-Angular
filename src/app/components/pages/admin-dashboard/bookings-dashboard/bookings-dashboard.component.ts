import { Component, OnInit } from '@angular/core';
import { Rental, RentalStatus } from 'src/app/models/rental';
import { PaymentService } from 'src/app/services/payment.service';
import { RentalService } from 'src/app/services/rental.service';
import { BookingFleetLifecycleService } from '../../../../services/booking-fleet-lifecycle.service';

@Component({ selector: 'app-admin-bookings', templateUrl: './bookings-dashboard.component.html', styleUrls: ['./bookings-dashboard.component.css'] })
export class AdminBookingsComponent implements OnInit {
  bookings: Rental[] = [];
  statusFilter = '';

  constructor(private rentalService: RentalService, private paymentService: PaymentService,
    private bookingFleetLifecycleService: BookingFleetLifecycleService) {}

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

  getFleetAwareBookingSummary(booking: any): any {
    return this.bookingFleetLifecycleService.getBookingSummary(booking);
  }

  cancelFleetAwareBooking(booking: any): void {


    const bookingKey = booking.bookingReference || booking.rentalId || booking.id;



    if (!bookingKey) {


      return;


    }



    const updatedBooking = this.bookingFleetLifecycleService.cancelBooking(bookingKey);



    if (updatedBooking) {


      Object.assign(booking, updatedBooking);


      this.refreshFleetAwareBookingCollections(updatedBooking);


    }


  }

  completeFleetAwareBooking(booking: any): void {


    const bookingKey = booking.bookingReference || booking.rentalId || booking.id;



    if (!bookingKey) {


      return;


    }



    const updatedBooking = this.bookingFleetLifecycleService.completeBooking(bookingKey);



    if (updatedBooking) {


      Object.assign(booking, updatedBooking);


      this.refreshFleetAwareBookingCollections(updatedBooking);


    }


  }

  private refreshFleetAwareBookingCollections(updatedBooking: any): void {
    const bookingCollections = [
      'bookings',
      'filteredBookings',
      'allBookings',
      'recentBookings',
      'rentals',
      'filteredRentals'
    ];

    bookingCollections.forEach(collectionName => {
      const collection = (this as any)[collectionName];

      if (!Array.isArray(collection)) {
        return;
      }

      (this as any)[collectionName] = collection.map((booking: any) =>
        this.isSameFleetAwareBooking(booking, updatedBooking)
          ? { ...booking, ...updatedBooking }
          : booking
      );
    });
  }

  private isSameFleetAwareBooking(left: any, right: any): boolean {
    return String(left?.bookingReference || '') === String(right?.bookingReference || '') ||
      String(left?.rentalId || '') === String(right?.rentalId || '') ||
      String(left?.id || '') === String(right?.id || '');
  }
}
