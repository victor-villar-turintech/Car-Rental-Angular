import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BookingExtraSelection } from 'src/app/models/booking-extra';
import { Rental } from 'src/app/models/rental';
import { BookingFleetLifecycleService } from 'src/app/services/booking-fleet-lifecycle.service';
import { RentalService } from 'src/app/services/rental.service';

interface FleetAwareLookupBooking extends Rental {
  paymentMethodLabel?: string;
  customerAddress?: string;
  flightNumber?: string;
  dropoffLocation?: string;
  bookingStatus?: string;
}

@Component({
  selector: 'app-booking-lookup',
  templateUrl: './booking-lookup.component.html',
  styleUrls: ['./booking-lookup.component.css'],
})
export class BookingLookupComponent {
  bookingReference = '';
  customerEmail = '';
  booking: FleetAwareLookupBooking | undefined;
  searched = false;
  editMode = false;
  editableName = '';
  editableEmail = '';
  editablePhone = '';
  confirmCancelVisible = false;

  private readonly blockingStatuses = new Set(['pending', 'confirmed', 'paid', 'active']);

  constructor(
    private rentalService: RentalService,
    private toastrService: ToastrService,
    private lifecycleService: BookingFleetLifecycleService
  ) {}

  searchBooking(): void {
    this.booking = undefined;
    this.searched = true;
    this.editMode = false;
    this.confirmCancelVisible = false;

    if (!this.bookingReference || !this.customerEmail) {
      this.toastrService.error('Booking reference and email are required.', 'Missing details');
      return;
    }

    this.rentalService.getBookingByReference(this.bookingReference, this.customerEmail).subscribe((response) => {
      if (!response.success || response.data.length === 0) {
        this.toastrService.error(response.message, 'Booking not found');
        return;
      }

      this.booking = response.data[0] as FleetAwareLookupBooking;
      this.editableName = this.booking.customerName || '';
      this.editableEmail = this.booking.customerEmail || '';
      this.editablePhone = this.booking.customerPhone || '';
      this.toastrService.success('Booking loaded.', 'Found');
    });
  }

  canCancel(): boolean {
    if (!this.booking) {
      return false;
    }
    const status = String(this.booking.status || this.booking.bookingStatus || 'Pending').toLowerCase();
    return this.blockingStatuses.has(status);
  }

  requestCancel(): void {
    if (!this.canCancel()) {
      return;
    }
    this.confirmCancelVisible = true;
  }

  cancelConfirmed(): void {
    this.confirmCancelVisible = false;

    if (!this.booking) {
      return;
    }

    const reference = this.booking.bookingReference || (this.booking.rentalId ? `RC-${this.booking.rentalId}` : '');
    if (!reference) {
      this.toastrService.error('Could not determine booking reference.', 'Cancellation failed');
      return;
    }

    const cancelled = this.lifecycleService.cancelBooking(reference);

    if (!cancelled) {
      this.toastrService.error(
        'Could not find or cancel the booking. Please try again.',
        'Cancellation failed'
      );
      return;
    }

    this.rentalService.reloadFromStorage();

    this.booking = {
      ...this.booking,
      ...cancelled,
      status: 'Cancelled',
      bookingStatus: 'Cancelled',
    };

    this.toastrService.success(
      this.booking.registrationNumber
        ? `Booking cancelled. Fleet unit ${this.booking.registrationNumber} is now available.`
        : 'Booking cancelled.',
      'Cancelled'
    );
  }

  cancelDismissed(): void {
    this.confirmCancelVisible = false;
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
        ...this.booking!,
        customerName: this.editableName,
        customerEmail: this.editableEmail,
        customerPhone: this.editablePhone,
      };
      this.customerEmail = this.editableEmail;
      this.editMode = false;
      this.toastrService.success('Customer details updated.', 'Updated');
    });
  }

  get displayStatus(): string {
    return this.booking?.status || this.booking?.bookingStatus || 'Pending';
  }

  get vehicleLabel(): string {
    if (!this.booking) {
      return '';
    }
    const year = this.booking.modelYear;
    const make = this.booking.brandName;
    const model = this.booking.carName;
    return [year, make, model].filter(Boolean).join(' ') || 'Vehicle';
  }

  get registrationNumber(): string {
    return this.booking?.registrationNumber || 'Not assigned';
  }

  get fleetUnitId(): string {
    const id = this.booking?.fleetVehicleId;
    return id ? `Fleet ID #${id}` : '';
  }

  get pickupLocationLabel(): string {
    return this.booking?.pickupLocationName || this.booking?.pickupLocation || 'Pickup branch not set';
  }

  get returnLocationLabel(): string {
    return (
      this.booking?.returnLocationName ||
      this.booking?.dropoffLocation ||
      this.booking?.pickupLocationName ||
      this.booking?.pickupLocation ||
      'Drop-off branch not set'
    );
  }

  get paymentMethodLabel(): string {
    return this.booking?.paymentMethodLabel || this.booking?.paymentMethod || 'Payment method not set';
  }

  get paymentStatus(): string {
    return String(this.booking?.paymentStatus || 'Pending');
  }

  get dailyPrice(): number {
    if (!this.booking) {
      return 0;
    }
    if (this.booking.dailyPrice) {
      return Number(this.booking.dailyPrice);
    }
    const subtotal = Number(this.booking.vehicleSubtotal || 0);
    const days = Number(this.booking.rentalDays || 0);
    return days > 0 ? Math.round(subtotal / days) : 0;
  }

  get extrasList(): BookingExtraSelection[] {
    return this.booking?.selectedExtras || [];
  }
}
