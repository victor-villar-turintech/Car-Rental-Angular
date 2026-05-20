import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DiscountCode } from 'src/app/models/discount-code';
import { PaymentMethod } from 'src/app/models/payment';
import { Rental } from 'src/app/models/rental';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';
import { CustomerActivityService } from 'src/app/services/customer-activity.service';
import { DiscountCodeService } from 'src/app/services/discount-code.service';
import { PaymentService } from 'src/app/services/payment.service';
import { RentalService } from 'src/app/services/rental.service';
import { RewardService } from 'src/app/services/reward.service';

@Component({ selector: 'app-payment-checkout', templateUrl: './payment-checkout.component.html', styleUrls: ['./payment-checkout.component.css'] })
export class PaymentCheckoutComponent implements OnInit {
  booking: Rental | undefined;
  bookingReference = '';
  method: PaymentMethod = 'Card';
  paymentForm: FormGroup;
  errorMessage = '';
  processing = false;
  appliedDiscount: DiscountCode | undefined;
  discountAmount = 0;
  rewardDiscountAmount = 0;
  rewardPointsBalance = 0;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private rentalService: RentalService, private paymentService: PaymentService, private discountCodeService: DiscountCodeService, private rewardService: RewardService, private customerAuthService: CustomerAuthService, private customerActivityService: CustomerActivityService, private toastrService: ToastrService) {
    this.paymentForm = this.fb.group({
      method: ['Card', [Validators.required]], discountCode: [''], rewardPointsToRedeem: [0],
      cardholderName: ['', [Validators.required]], cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]], expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]], billingPostcode: ['', [Validators.required]],
    }, { validators: this.cardExpiryValidator });
  }

  ngOnInit(): void { this.route.params.subscribe((params) => { this.bookingReference = params.bookingReference || ''; this.loadBooking(); }); }
  get f() { return this.paymentForm.controls; }
  get grossTotal(): number { return Number(this.booking?.totalRentPrice || 0); }
  get finalTotal(): number { return Math.max(0, this.grossTotal - this.discountAmount - this.rewardDiscountAmount); }

  loadBooking(): void {
    if (!this.bookingReference) { this.errorMessage = 'Missing booking reference.'; return; }
    this.rentalService.getBookingByReferenceOnly(this.bookingReference).subscribe((response) => {
      this.booking = response.data[0]; this.errorMessage = this.booking ? '' : 'Booking not found.';
      if (this.booking?.customerName) { this.paymentForm.patchValue({ cardholderName: this.booking.customerName }); }
      const email = this.booking?.customerEmail || this.customerAuthService.getCurrentCustomer()?.email || '';
      this.rewardPointsBalance = email ? this.rewardService.getAccount(email).pointsBalance : 0;
    });
  }

  selectMethod(method: PaymentMethod): void { this.method = method; this.paymentForm.patchValue({ method }); this.errorMessage = ''; this.updateCardValidators(); }

  applyDiscountCode(): void {
    const code = String(this.paymentForm.get('discountCode')?.value || '').trim();
    if (!code) { this.appliedDiscount = undefined; this.discountAmount = 0; return; }
    const result = this.discountCodeService.validateCode(code, this.grossTotal);
    if (!result.valid) { this.appliedDiscount = undefined; this.discountAmount = 0; this.toastrService.error(result.message, 'Discount'); return; }
    this.appliedDiscount = result.code; this.discountAmount = result.discountAmount; this.toastrService.success(result.message, 'Discount applied');
    if (this.booking?.customerEmail) { this.customerActivityService.record(this.booking.customerEmail, 'DiscountApplied', `Discount code ${result.code?.code} applied to ${this.bookingReference}.`, { entityReference: this.bookingReference, metadata: { discountAmount: result.discountAmount } }); }
  }

  redeemRewards(): void {
    const email = this.booking?.customerEmail || this.customerAuthService.getCurrentCustomer()?.email || '';
    const points = Number(this.paymentForm.get('rewardPointsToRedeem')?.value || 0);
    const result = this.rewardService.redeemPoints(email, points, this.bookingReference);
    if (!result.success) { this.rewardDiscountAmount = 0; this.toastrService.error(result.message, 'Rewards'); return; }
    this.rewardDiscountAmount = result.discountAmount; this.rewardPointsBalance = this.rewardService.getAccount(email).pointsBalance; this.toastrService.success(result.message, 'Rewards applied');
  }

  pay(): void {
    if (!this.booking) { this.errorMessage = 'Booking not found.'; return; }
    this.updateCardValidators();
    if (this.paymentForm.invalid) { this.paymentForm.markAllAsTouched(); this.errorMessage = 'Please complete the required payment fields.'; return; }
    const value = this.paymentForm.value; this.processing = true;
    this.paymentService.createPayment({ bookingReference: this.booking.bookingReference || this.bookingReference, method: this.method, amount: this.finalTotal, grossAmount: this.grossTotal, discountCode: this.appliedDiscount?.code, discountAmount: this.discountAmount, rewardDiscountAmount: this.rewardDiscountAmount, customerEmail: this.booking.customerEmail, cardholderName: this.method === 'Card' ? value.cardholderName : undefined, cardNumber: this.method === 'Card' ? value.cardNumber : undefined, billingPostcode: this.method === 'Card' ? value.billingPostcode : undefined }).subscribe((response) => {
      if (this.appliedDiscount?.code) { this.discountCodeService.markCodeUsed(this.appliedDiscount.code); }
      const payment = response.data[0];
      this.rentalService.updateBookingPayment(this.bookingReference, { paymentStatus: payment.status, paymentMethod: payment.method, paymentReference: payment.transactionReference, paidAt: payment.createdAt, discountCode: this.appliedDiscount?.code, discountAmount: this.discountAmount, rewardDiscountAmount: this.rewardDiscountAmount, grossTotal: this.grossTotal, totalRentPrice: this.finalTotal } as any).subscribe(() => { this.processing = false; this.toastrService.success('Mock payment completed.', 'Payment'); this.router.navigate(['/booking-confirmation', this.bookingReference]); });
    });
  }

  private updateCardValidators(): void {
    ['cardholderName', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvc', 'billingPostcode'].forEach((field) => {
      const control = this.paymentForm.get(field); if (!control) { return; }
      if (this.method !== 'Card') { control.clearValidators(); control.updateValueAndValidity({ emitEvent: false }); return; }
      const validators = field === 'cardNumber' ? [Validators.required, Validators.pattern(/^\d{16}$/)] : field === 'cvc' ? [Validators.required, Validators.pattern(/^\d{3,4}$/)] : field === 'expiryMonth' ? [Validators.required, Validators.min(1), Validators.max(12)] : field === 'expiryYear' ? [Validators.required, Validators.min(new Date().getFullYear())] : [Validators.required];
      control.setValidators(validators); control.updateValueAndValidity({ emitEvent: false });
    });
  }

  private cardExpiryValidator(group: AbstractControl): { [key: string]: boolean } | null {
    if (group.get('method')?.value !== 'Card') { return null; }
    const month = Number(group.get('expiryMonth')?.value); const year = Number(group.get('expiryYear')?.value);
    if (!month || !year) { return null; }
    const now = new Date(); const expiry = new Date(year, month, 0);
    if (expiry < new Date(now.getFullYear(), now.getMonth(), 1)) { group.get('expiryYear')?.setErrors({ expired: true }); return { expired: true }; }
    return null;
  }
}
