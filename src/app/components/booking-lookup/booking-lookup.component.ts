import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Rental } from 'src/app/models/rental';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-booking-lookup',
  templateUrl: './booking-lookup.component.html',
  styleUrls: ['./booking-lookup.component.css'],
})
export class BookingLookupComponent {
  bookingReference = '';
  customerEmail = '';
  booking: Rental;
  searched = false;
  editMode = false;
  editableName = '';
  editableEmail = '';
  editablePhone = '';

  constructor(private rentalService: RentalService, private toastrService: ToastrService) {}

  searchBooking(): void {
    this.booking = undefined;
    this.searched = true;
    this.editMode = false;

    if (!this.bookingReference || !this.customerEmail) {
      this.toastrService.error('Booking reference and email are required.', 'Missing details');
      return;
    }

    this.rentalService.getBookingByReference(this.bookingReference, this.customerEmail).subscribe((response) => {
      if (!response.success || response.data.length === 0) {
        this.toastrService.error(response.message, 'Booking not found');
        return;
      }

      this.booking = response.data[0];
      this.editableName = this.booking.customerName || '';
      this.editableEmail = this.booking.customerEmail || '';
      this.editablePhone = this.booking.customerPhone || '';
      this.toastrService.success('Booking loaded.', 'Found');
    });
  }

  canCancel(): boolean {
    return !!this.booking && ['Pending', 'Confirmed'].includes(this.booking.status || 'Pending');
  }

  cancelBooking(): void {
    if (!this.booking?.rentalId || !this.canCancel()) {
      return;
    }

    this.rentalService.updateRentalStatus(this.booking.rentalId, 'Cancelled').subscribe(() => {
      this.booking = { ...this.booking, status: 'Cancelled' };
      this.toastrService.success('Booking cancelled locally.', 'Cancelled');
    });
  }

  saveCustomerDetails(): void {
    if (!this.booking?.rentalId) {
      return;
    }

    if (!this.editableName || !this.editableEmail) {
      this.toastrService.error('Name and email are required.', 'Missing details');
      return;
    }

    this.rentalService.updateCustomerDetails(this.booking.rentalId, {
      customerName: this.editableName,
      customerEmail: this.editableEmail,
      customerPhone: this.editablePhone,
    }).subscribe(() => {
      this.booking = {
        ...this.booking,
        customerName: this.editableName,
        customerEmail: this.editableEmail,
        customerPhone: this.editablePhone,
      };
      this.customerEmail = this.editableEmail;
      this.editMode = false;
      this.toastrService.success('Customer details updated locally.', 'Updated');
    });
  }
}
