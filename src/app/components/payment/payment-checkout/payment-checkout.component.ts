import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PaymentMethod } from 'src/app/models/payment';
import { Rental } from 'src/app/models/rental';
import { PaymentService } from 'src/app/services/payment.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-payment-checkout',
  templateUrl: './payment-checkout.component.html',
  styleUrls: ['./payment-checkout.component.css'],
})
export class PaymentCheckoutComponent implements OnInit {
  booking: Rental | undefined;
  bookingReference = '';
  method: PaymentMethod = 'Card';
  cardholderName = '';
  cardNumber = '';
  expiryMonth = '';
  expiryYear = '';
  cvc = '';
  billingPostcode = '';
  errorMessage = '';
  processing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rentalService: RentalService,
    private paymentService: PaymentService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.bookingReference = params.bookingReference || '';
      this.loadBooking();
    });
  }

  loadBooking(): void {
    if (!this.bookingReference) {
      this.errorMessage = 'Missing booking reference.';
      return;
    }

    this.rentalService.getBookingByReferenceOnly(this.bookingReference).subscribe((response) => {
      this.booking = response.data[0];
      this.errorMessage = this.booking ? '' : 'Booking not found.';
      if (this.booking?.customerName) {
        this.cardholderName = this.booking.customerName;
      }
    });
  }

  selectMethod(method: PaymentMethod): void {
    this.method = method;
    this.errorMessage = '';
  }

  pay(): void {
    if (!this.booking) {
      this.errorMessage = 'Booking not found.';
      return;
    }

    if (this.method === 'Card' && !this.isValidCard()) {
      return;
    }

    this.processing = true;
    this.paymentService.createPayment({
      bookingReference: this.booking.bookingReference || this.bookingReference,
      method: this.method,
      amount: Number(this.booking.totalRentPrice || 0),
      cardholderName: this.method === 'Card' ? this.cardholderName : undefined,
      cardNumber: this.method === 'Card' ? this.cardNumber : undefined,
      billingPostcode: this.method === 'Card' ? this.billingPostcode : undefined,
    }).subscribe((response) => {
      const payment = response.data[0];
      this.rentalService.updateBookingPayment(this.bookingReference, {
        paymentStatus: payment.status,
        paymentMethod: payment.method,
        paymentReference: payment.transactionReference,
        paidAt: payment.createdAt,
      }).subscribe(() => {
        this.processing = false;
        this.toastrService.success('Mock payment completed.', 'Payment');
        this.router.navigate(['/booking-confirmation', this.bookingReference]);
      });
    });
  }

  private isValidCard(): boolean {
    const digits = this.cardNumber.replace(/\D/g, '');
    const cvcDigits = this.cvc.replace(/\D/g, '');
    const month = Number(this.expiryMonth);
    const year = Number(this.expiryYear);
    const now = new Date();
    const expiry = new Date(year, month, 0);

    if (!this.cardholderName.trim()) {
      this.errorMessage = 'Cardholder name is required.';
      return false;
    }
    if (digits.length !== 16) {
      this.errorMessage = 'Card number must contain 16 digits for this demo.';
      return false;
    }
    if (![3, 4].includes(cvcDigits.length)) {
      this.errorMessage = 'CVC must contain 3 or 4 digits.';
      return false;
    }
    if (!month || month < 1 || month > 12 || !year || expiry < new Date(now.getFullYear(), now.getMonth(), 1)) {
      this.errorMessage = 'Expiry date must be valid and not in the past.';
      return false;
    }
    if (!this.billingPostcode.trim()) {
      this.errorMessage = 'Billing postcode is required.';
      return false;
    }

    this.errorMessage = '';
    return true;
  }
}
