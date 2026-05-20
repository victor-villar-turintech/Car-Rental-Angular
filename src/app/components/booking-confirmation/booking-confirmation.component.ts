import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Payment } from 'src/app/models/payment';
import { Rental } from 'src/app/models/rental';
import { PaymentService } from 'src/app/services/payment.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.css'],
})
export class BookingConfirmationComponent implements OnInit {
  booking: Rental | undefined;
  payment: Payment | undefined;
  bookingReference = '';
  copied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rentalService: RentalService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.bookingReference = params.bookingReference || '';
      this.loadReceipt();
    });
  }

  loadReceipt(): void {
    this.rentalService.getBookingByReferenceOnly(this.bookingReference).subscribe((response) => {
      this.booking = response.data[0];
    });
    this.paymentService.getPaymentByBookingReference(this.bookingReference).subscribe((response) => {
      this.payment = response.data[0];
    });
  }

  copyReference(): void {
    if (!this.bookingReference) { return; }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.bookingReference).then(() => this.copied = true);
      return;
    }
    this.copied = true;
  }

  printReceipt(): void { window.print(); }
  goToAccountBookings(): void { this.router.navigate(['/account/bookings']); }
}
