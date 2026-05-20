import { Component, OnInit } from '@angular/core';
import { Rental, RentalStatus } from 'src/app/models/rental';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './bookings-dashboard.component.html',
  styleUrls: ['./bookings-dashboard.component.css'],
})
export class AdminBookingsComponent implements OnInit {
  bookings: Rental[] = [];
  statusFilter = '';

  constructor(private rentalService: RentalService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  get filteredBookings(): Rental[] {
    const bookings = this.statusFilter
      ? this.bookings.filter((booking) => booking.status === this.statusFilter)
      : this.bookings;

    return [...bookings].sort((a, b) => {
      const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return right - left;
    });
  }

  loadBookings(): void {
    this.rentalService.getRental().subscribe((response) => {
      this.bookings = response.data;
    });
  }

  updateStatus(booking: Rental, status: RentalStatus): void {
    if (!booking.rentalId || !this.canMoveToStatus(booking, status)) {
      return;
    }

    this.rentalService.updateRentalStatus(booking.rentalId, status).subscribe(() => this.loadBookings());
  }

  getAvailableActions(booking: Rental): RentalStatus[] {
    switch (booking.status) {
      case 'Pending':
        return ['Confirmed', 'Cancelled'];
      case 'Confirmed':
        return ['Active', 'Cancelled'];
      case 'Active':
        return ['Completed'];
      default:
        return [];
    }
  }

  getActionLabel(status: RentalStatus): string {
    const labels: { [key: string]: string } = {
      Confirmed: 'Confirm',
      Active: 'Mark active',
      Completed: 'Complete',
      Cancelled: 'Cancel',
    };
    return labels[status] || status;
  }

  canMoveToStatus(booking: Rental, status: RentalStatus): boolean {
    return this.getAvailableActions(booking).includes(status);
  }

  totalRevenue(): number {
    return this.bookings
      .filter((booking) => booking.status !== 'Cancelled')
      .reduce((total, booking) => total + Number(booking.totalRentPrice || 0), 0);
  }

  countByStatus(status: RentalStatus): number {
    return this.bookings.filter((booking) => booking.status === status).length;
  }
}
