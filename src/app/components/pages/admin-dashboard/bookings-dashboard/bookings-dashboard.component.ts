import { Component, OnInit } from '@angular/core';
import { Rental, RentalStatus } from 'src/app/models/rental';
import { PaymentService } from 'src/app/services/payment.service';
import { RentalService } from 'src/app/services/rental.service';
import { BookingFleetLifecycleService } from '../../../../services/booking-fleet-lifecycle.service';
import { FleetAvailabilityService } from 'src/app/services/fleet-availability.service';

interface LocationFilterOption {
  id: string;
  label: string;
}

@Component({ selector: 'app-admin-bookings', templateUrl: './bookings-dashboard.component.html', styleUrls: ['./bookings-dashboard.component.css'] })
export class AdminBookingsComponent implements OnInit {
  bookings: Rental[] = [];

  statusFilter = '';
  paymentFilter = '';
  locationFilter = '';
  searchTerm = '';
  fromDate = '';
  toDate = '';
  expandedRef: string | null = null;

  locationOptions: LocationFilterOption[] = [];

  constructor(private rentalService: RentalService, private paymentService: PaymentService,
    private bookingFleetLifecycleService: BookingFleetLifecycleService,
    private fleetAvailabilityService: FleetAvailabilityService) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadLocationOptions();
  }

  private loadLocationOptions(): void {
    const locations = this.fleetAvailabilityService.getRentalLocations() || [];
    this.locationOptions = locations.map((location) => ({
      id: String(location.id),
      label: location.name || `Location ${location.id}`
    }));
  }

  get filteredBookings(): Rental[] {
    const term = this.searchTerm.trim().toLowerCase();
    const from = this.fromDate ? new Date(this.fromDate).getTime() : null;
    const to = this.toDate ? new Date(this.toDate).getTime() : null;

    const filtered = this.bookings.filter((booking) => {
      if (this.statusFilter && booking.status !== this.statusFilter) {
        return false;
      }

      if (this.paymentFilter && (booking.paymentStatus || 'Pending') !== this.paymentFilter) {
        return false;
      }

      if (this.locationFilter) {
        const pickupId = booking.pickupLocationId != null ? String(booking.pickupLocationId) : '';
        const returnId = booking.returnLocationId != null ? String(booking.returnLocationId) : '';
        if (pickupId !== this.locationFilter && returnId !== this.locationFilter) {
          return false;
        }
      }

      if (term) {
        const ref = (booking.bookingReference || `RC-${booking.rentalId}`).toLowerCase();
        const name = (booking.customerName || '').toLowerCase();
        const email = (booking.customerEmail || '').toLowerCase();
        const plate = (booking.numberPlate || '').toLowerCase();
        if (!ref.includes(term) && !name.includes(term) && !email.includes(term) && !plate.includes(term)) {
          return false;
        }
      }

      const pickupAt = booking.rentDate ? new Date(booking.rentDate).getTime() : null;
      if (from !== null && (pickupAt === null || pickupAt < from)) {
        return false;
      }
      if (to !== null && (pickupAt === null || pickupAt > to)) {
        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return right - left;
    });
  }

  loadBookings(): void { this.rentalService.getRental().subscribe((response) => this.bookings = response.data); }

  resetFilters(): void {
    this.statusFilter = '';
    this.paymentFilter = '';
    this.locationFilter = '';
    this.searchTerm = '';
    this.fromDate = '';
    this.toDate = '';
  }

  toggleExpanded(booking: Rental): void {
    const key = booking.bookingReference || `RC-${booking.rentalId}`;
    this.expandedRef = this.expandedRef === key ? null : key;
  }

  isExpanded(booking: Rental): boolean {
    const key = booking.bookingReference || `RC-${booking.rentalId}`;
    return this.expandedRef === key;
  }

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

  filteredRevenue(): number {
    return this.filteredBookings.filter((booking) => booking.status !== 'Cancelled').reduce((total, booking) => total + Number(booking.totalRentPrice || 0), 0);
  }

  countByStatus(status: RentalStatus): number { return this.bookings.filter((booking) => booking.status === status).length; }

  paymentStatusVariant(status: string | undefined): string {
    const normalised = (status || 'Pending').toLowerCase();
    if (normalised === 'paid') { return 'paid'; }
    if (normalised === 'refunded') { return 'refunded'; }
    if (normalised === 'failed') { return 'failed'; }
    return 'pending';
  }

  bookingStatusVariant(status: string | undefined): string {
    return (status || 'Pending').toLowerCase();
  }

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
    if (!left || !right) {
      return false;
    }

    if (left.bookingReference && right.bookingReference) {
      return left.bookingReference === right.bookingReference;
    }

    const leftId = left.rentalId || left.id;
    const rightId = right.rentalId || right.id;

    return leftId != null && rightId != null && Number(leftId) === Number(rightId);
  }
}
