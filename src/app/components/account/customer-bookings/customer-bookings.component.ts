import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Rental } from 'src/app/models/rental';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-customer-bookings',
  templateUrl: './customer-bookings.component.html',
  styleUrls: ['./customer-bookings.component.css'],
})
export class CustomerBookingsComponent implements OnInit {
  bookings: Rental[] = [];
  customerEmail = '';

  constructor(
    private authService: CustomerAuthService,
    private rentalService: RentalService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    const customer = this.authService.getCurrentCustomer();
    this.customerEmail = customer?.email || '';
    this.loadBookings();
  }

  loadBookings(): void {
    if (!this.customerEmail) {
      this.bookings = [];
      return;
    }

    this.rentalService.getBookingsForCustomer(this.customerEmail).subscribe((response) => {
      this.bookings = response.data.sort((a, b) => {
        const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return right - left;
      });
    });
  }

  canCancel(booking: Rental): boolean {
    return ['Pending', 'Confirmed'].includes(booking.status || 'Pending');
  }

  cancelBooking(booking: Rental): void {
    if (!booking.rentalId || !this.canCancel(booking)) {
      return;
    }

    this.rentalService.updateRentalStatus(booking.rentalId, 'Cancelled').subscribe((response) => {
      this.toastrService.success(response.message, 'Cancelled');
      this.loadBookings();
    });
  }

  copyReference(booking: Rental): void {
    const reference = booking.bookingReference || '';
    if (!reference) {
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(reference).then(() => this.toastrService.success('Booking reference copied.'));
      return;
    }

    this.toastrService.info(reference, 'Booking reference');
  }
}
