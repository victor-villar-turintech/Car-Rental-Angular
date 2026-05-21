import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  FleetAvailabilityService,
  FleetAwareBookingSelection
} from '../../../services/fleet-availability.service';

interface RentalExtraOption {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  selected: boolean;
}

interface PaymentMethodOption {
  id: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-fleet-aware-rental-flow',
  templateUrl: './fleet-aware-rental-flow.component.html',
  styleUrls: ['./fleet-aware-rental-flow.component.css']
})
export class FleetAwareRentalFlowComponent implements OnInit {
  vehicle: any;
  rentalLocations: any[] = [];
  availableAtSelectedBranch = 0;

  currentStep = 1;

  selectedPickupLocationId = '';
  selectedReturnLocationId = '';
  rentDate = '';
  returnDate = '';
  rentalLengthDays = 1;
  dateValidationError = '';
  readonly minimumRentalDays = 1;
  readonly maximumRentalDays = 30;

  customerName = 'John Doe';
  customerEmail = 'demo.user@example.com';
  customerPhone = '07123 456789';
  customerAddress = '';
  driverLicenceNumber = '';
  flightNumber = '';

  selectedPaymentMethod = 'credit-card';
  paymentName = 'John Doe';
  paymentCardNumber = '4111 1111 1111 1111';
  paymentExpiry = '12/28';
  paymentCvv = '123';
  paypalEmail = 'demo.user@example.com';
  applePayDeviceName = 'Apple Pay wallet';
  googlePayAccount = 'Google Pay wallet';

  paymentMethods: PaymentMethodOption[] = [
    {
      id: 'credit-card',
      label: 'Credit / debit card',
      description: 'Pay securely with Visa, Mastercard, or Amex.'
    },
    {
      id: 'paypal',
      label: 'PayPal',
      description: 'Use your PayPal account for this booking.'
    },
    {
      id: 'apple-pay',
      label: 'Apple Pay',
      description: 'Pay quickly using Apple Pay on this device.'
    },
    {
      id: 'google-pay',
      label: 'Google Pay',
      description: 'Use Google Pay for fast checkout.'
    },
    {
      id: 'pay-at-branch',
      label: 'Pay at branch',
      description: 'Reserve now and pay during pickup.'
    }
  ];

  extras: RentalExtraOption[] = [];

  bookingError = '';
  bookingSuccess = '';
  receiptBooking: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private availabilityService: FleetAvailabilityService
  ) {}

  ngOnInit(): void {
    this.rentalLocations = this.availabilityService.getRentalLocations();
    this.extras = this.loadExtras();

    const id = Number(this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('carId'));
    this.vehicle = this.availabilityService.getCatalogueItems()
      .find(item => Number(item.id) === id);

    if (!this.vehicle) {
      this.bookingError = 'Vehicle not found.';
      return;
    }

    const summary = this.availabilityService.getAvailabilitySummary(this.vehicle.id);
    const firstLocationId = summary.availableLocationIds[0] || this.rentalLocations[0]?.id;

    if (firstLocationId) {
      this.selectedPickupLocationId = String(firstLocationId);
      this.selectedReturnLocationId = String(firstLocationId);
    }

    this.setDefaultDates();
    this.refreshAvailability();
  }

  getDisplayName(): string {
    if (!this.vehicle) {
      return '';
    }

    return `${this.vehicle.make || ''} ${this.vehicle.model || ''}${this.vehicle.trim ? ' ' + this.vehicle.trim : ''}`.trim();
  }

  getRentalDays(): number {
    return this.rentalLengthDays || 0;
  }

  getCalculatedRentalDaysFromDates(): number {
    if (!this.rentDate || !this.returnDate) {
      return 0;
    }

    const start = this.parseDate(this.rentDate);
    const end = this.parseDate(this.returnDate);

    if (!start || !end || end < start) {
      return 0;
    }

    return this.daysBetweenInclusive(start, end);
  }

  getVehicleSubtotal(): number {
    return this.getRentalDays() * Number(this.vehicle?.baseDailyPrice || 0);
  }

  getExtrasTotal(): number {
    return this.getSelectedExtras()
      .reduce((total, extra) => total + Number(extra.price || 0), 0);
  }

  getTotalPrice(): number {
    return this.getVehicleSubtotal() + this.getExtrasTotal();
  }

  getSelectedExtras(): RentalExtraOption[] {
    return this.extras.filter(extra => extra.selected);
  }

  getExtrasByCategory(category: string): RentalExtraOption[] {
    return this.extras.filter(extra => extra.category === category);
  }

  getExtraCategories(): string[] {
    return Array.from(new Set(this.extras.map(extra => extra.category)));
  }

  getPickupLocationName(): string {
    return this.rentalLocations.find(location => String(location.id) === String(this.selectedPickupLocationId))?.name || '';
  }

  getReturnLocationName(): string {
    return this.rentalLocations.find(location => String(location.id) === String(this.selectedReturnLocationId))?.name || this.getPickupLocationName();
  }

  getSelectedPaymentMethodLabel(): string {
    return this.paymentMethods.find(method => method.id === this.selectedPaymentMethod)?.label || 'Payment';
  }

  onPickupDateChange(): void {
    this.dateValidationError = '';

    if (!this.rentDate) {
      this.returnDate = '';
      this.availableAtSelectedBranch = 0;
      return;
    }

    if (!this.returnDate || this.parseDate(this.returnDate)! < this.parseDate(this.rentDate)!) {
      this.returnDate = this.addDays(this.rentDate, this.rentalLengthDays - 1);
    } else {
      this.syncRentalLengthFromDates();
    }

    this.refreshAvailability();
  }

  onReturnDateChange(): void {
    this.dateValidationError = '';

    if (!this.rentDate) {
      this.dateValidationError = 'Please select a pickup date before selecting a return date.';
      this.returnDate = '';
      this.availableAtSelectedBranch = 0;
      return;
    }

    if (!this.returnDate) {
      this.availableAtSelectedBranch = 0;
      return;
    }

    const start = this.parseDate(this.rentDate);
    const end = this.parseDate(this.returnDate);

    if (!start || !end) {
      this.dateValidationError = 'Please select valid rental dates.';
      this.availableAtSelectedBranch = 0;
      return;
    }

    if (end < start) {
      this.dateValidationError = 'Return date cannot be before pickup date.';
      this.returnDate = this.rentDate;
    }

    this.syncRentalLengthFromDates();
    this.refreshAvailability();
  }

  onRentalLengthChange(): void {
    this.dateValidationError = '';

    if (!this.rentDate) {
      this.dateValidationError = 'Please select a pickup date before setting rental length.';
      this.returnDate = '';
      this.availableAtSelectedBranch = 0;
      return;
    }

    const normalisedLength = Number(this.rentalLengthDays);

    if (!Number.isFinite(normalisedLength) || normalisedLength < this.minimumRentalDays) {
      this.rentalLengthDays = this.minimumRentalDays;
    }

    if (this.rentalLengthDays > this.maximumRentalDays) {
      this.rentalLengthDays = this.maximumRentalDays;
    }

    this.returnDate = this.addDays(this.rentDate, this.rentalLengthDays - 1);
    this.refreshAvailability();
  }

  refreshAvailability(): void {
    if (!this.vehicle) {
      this.availableAtSelectedBranch = 0;
      return;
    }

    this.availableAtSelectedBranch = this.availabilityService.getAvailableFleetUnits(
      this.vehicle.id,
      this.rentDate,
      this.returnDate,
      this.selectedPickupLocationId ? Number(this.selectedPickupLocationId) : undefined
    ).length;
  }

  onPickupLocationChange(): void {
    if (!this.selectedReturnLocationId) {
      this.selectedReturnLocationId = this.selectedPickupLocationId;
    }

    this.refreshAvailability();
  }

  goToStep(step: number): void {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  nextStep(): void {
    this.bookingError = '';

    if (this.currentStep === 1 && !this.validateVehicleStep()) {
      return;
    }

    if (this.currentStep === 2 && !this.validateDetailsStep()) {
      return;
    }

    if (this.currentStep === 3) {
      this.confirmAndPay();
      return;
    }

    this.currentStep += 1;
  }

  previousStep(): void {
    this.bookingError = '';
    this.currentStep = Math.max(1, this.currentStep - 1);
  }

  confirmAndPay(): void {
    this.bookingError = '';
    this.bookingSuccess = '';

    if (!this.validatePaymentStep()) {
      return;
    }

    const selection = this.availabilityService.buildBookingSelection(
      this.vehicle.id,
      this.rentDate,
      this.returnDate,
      Number(this.selectedPickupLocationId),
      Number(this.selectedReturnLocationId || this.selectedPickupLocationId)
    );

    if (!selection) {
      this.bookingError = 'No fleet unit is available for the selected vehicle, branch, and dates.';
      this.refreshAvailability();
      return;
    }

    const booking = this.createBooking(selection);
    this.saveBooking(booking);

    this.receiptBooking = booking;
    this.bookingSuccess = `Booking ${booking.bookingReference} confirmed.`;
    this.currentStep = 4;
    this.refreshAvailability();
  }

  backToCatalogue(): void {
    this.router.navigate(['/cars']);
  }

  private validateVehicleStep(): boolean {
    this.dateValidationError = '';

    if (!this.rentDate) {
      this.bookingError = 'Please select a pickup date.';
      this.dateValidationError = this.bookingError;
      return false;
    }

    if (!this.returnDate) {
      this.bookingError = 'Please select a return date.';
      this.dateValidationError = this.bookingError;
      return false;
    }

    const start = this.parseDate(this.rentDate);
    const end = this.parseDate(this.returnDate);

    if (!start || !end) {
      this.bookingError = 'Please select valid rental dates.';
      this.dateValidationError = this.bookingError;
      return false;
    }

    if (end < start) {
      this.bookingError = 'Return date must be the same day or after pickup date.';
      this.dateValidationError = this.bookingError;
      return false;
    }

    this.syncRentalLengthFromDates();

    if (this.rentalLengthDays < this.minimumRentalDays) {
      this.bookingError = 'Rental length must be at least 1 day.';
      this.dateValidationError = this.bookingError;
      return false;
    }

    if (this.rentalLengthDays > this.maximumRentalDays) {
      this.bookingError = `Rental length cannot exceed ${this.maximumRentalDays} days.`;
      this.dateValidationError = this.bookingError;
      return false;
    }

    if (!this.selectedPickupLocationId) {
      this.bookingError = 'Please select a pickup location.';
      return false;
    }

    if (!this.selectedReturnLocationId) {
      this.selectedReturnLocationId = this.selectedPickupLocationId;
    }

    this.refreshAvailability();

    if (this.availableAtSelectedBranch <= 0) {
      this.bookingError = 'No fleet units are available for the selected branch and dates.';
      return false;
    }

    return true;
  }

  private validateDetailsStep(): boolean {
    if (!this.customerName || !this.customerEmail || !this.customerPhone) {
      this.bookingError = 'Please complete customer name, email, and phone.';
      return false;
    }

    return true;
  }

  private validatePaymentStep(): boolean {
    if (!this.selectedPaymentMethod) {
      this.bookingError = 'Please select a payment method.';
      return false;
    }

    if (this.selectedPaymentMethod === 'credit-card' && (!this.paymentName || !this.paymentCardNumber || !this.paymentExpiry || !this.paymentCvv)) {
      this.bookingError = 'Please complete all card payment fields.';
      return false;
    }

    if (this.selectedPaymentMethod === 'paypal' && !this.paypalEmail) {
      this.bookingError = 'Please enter the PayPal account email.';
      return false;
    }

    return true;
  }

  private createBooking(selection: FleetAwareBookingSelection): any {
    const bookings = this.getBookings();
    const rentalId = bookings.length > 0
      ? Math.max(...bookings.map(booking => Number(booking.rentalId || booking.id || 0))) + 1
      : 1;

    const paymentStatus = this.selectedPaymentMethod === 'pay-at-branch' ? 'Pending' : 'Paid';

    const baseBooking = {
      rentalId,
      id: rentalId,
      bookingReference: this.createBookingReference(selection.catalogueItem.make, selection.catalogueItem.model),
      rentDate: this.rentDate,
      returnDate: this.returnDate,
      rentalDays: this.getRentalDays(),
      totalRentPrice: this.getTotalPrice(),
      vehicleSubtotal: this.getVehicleSubtotal(),
      extrasTotal: this.getExtrasTotal(),
      paymentStatus,
      paymentMethod: this.selectedPaymentMethod,
      paymentMethodLabel: this.getSelectedPaymentMethodLabel(),
      status: 'Confirmed',
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone,
      customerAddress: this.customerAddress,
      driverLicenceNumber: this.driverLicenceNumber,
      flightNumber: this.flightNumber,
      pickupLocation: selection.pickupLocation?.name || this.getPickupLocationName(),
      dropoffLocation: selection.returnLocation?.name || this.getReturnLocationName(),
      selectedExtras: this.getSelectedExtras().map(extra => ({
        id: extra.id,
        name: extra.name,
        description: extra.description,
        category: extra.category,
        price: extra.price
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.availabilityService.enrichBookingWithFleetSelection(baseBooking, selection);
  }

  private saveBooking(booking: any): void {
    const bookings = this.getBookings();
    localStorage.setItem('rent-a-car-demo-bookings', JSON.stringify([...bookings, booking]));
  }

  private getBookings(): any[] {
    const stored = localStorage.getItem('rent-a-car-demo-bookings');

    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private loadExtras(): RentalExtraOption[] {
    const discovered = this.loadExtrasFromStorage();

    if (discovered.length > 0) {
      return this.mergeExtras(discovered, this.defaultExtras());
    }

    return this.defaultExtras();
  }

  private loadExtrasFromStorage(): RentalExtraOption[] {
    const knownKeys = [
      'rent-a-car-demo-extras',
      'rent-a-car-demo-service-options',
      'rent-a-car-demo-additional-services',
      'rent-a-car-demo-addons',
      'rentalExtras',
      'additionalServices',
      'serviceOptions',
      'extras'
    ];

    const matchingKeys = Object.keys(localStorage)
      .filter(key => {
        const lower = key.toLowerCase();
        return knownKeys.includes(key) ||
          lower.includes('extra') ||
          lower.includes('addon') ||
          lower.includes('service-option') ||
          lower.includes('additional-service');
      });

    const extras: RentalExtraOption[] = [];

    matchingKeys.forEach(key => {
      const stored = localStorage.getItem(key);

      if (!stored) {
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        const sourceArray = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.items)
            ? parsed.items
            : Array.isArray(parsed?.extras)
              ? parsed.extras
              : [];

        sourceArray.forEach((item: any, index: number) => {
          const name = String(item.name || item.title || item.label || item.serviceName || '').trim();

          if (!name) {
            return;
          }

          extras.push({
            id: Number(item.id || item.extraId || item.serviceId || extras.length + index + 1),
            name,
            description: String(item.description || item.details || item.summary || ''),
            price: Number(item.price || item.dailyPrice || item.amount || item.cost || 0),
            category: String(item.category || item.type || 'Additional services'),
            selected: Boolean(item.selected || item.includedByDefault)
          });
        });
      } catch {
        // Ignore malformed demo keys.
      }
    });

    return extras;
  }

  private mergeExtras(primary: RentalExtraOption[], fallback: RentalExtraOption[]): RentalExtraOption[] {
    const seen = new Set<string>();
    const result: RentalExtraOption[] = [];

    [...primary, ...fallback].forEach(extra => {
      const key = `${extra.name.toLowerCase()}|${extra.category.toLowerCase()}`;

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      result.push({
        ...extra,
        id: result.length + 1
      });
    });

    return result;
  }

  private defaultExtras(): RentalExtraOption[] {
    return [
      {
        id: 1,
        name: 'Additional driver',
        description: 'Add one extra authorised driver to the rental agreement.',
        price: 18,
        category: 'Drivers',
        selected: false
      },
      {
        id: 2,
        name: 'Premium insurance',
        description: 'Reduce excess and include enhanced cover for the trip.',
        price: 25,
        category: 'Protection',
        selected: true
      },
      {
        id: 3,
        name: 'Full damage waiver',
        description: 'Extra protection against accidental damage charges.',
        price: 32,
        category: 'Protection',
        selected: false
      },
      {
        id: 4,
        name: 'Roadside assistance plus',
        description: 'Priority roadside recovery and replacement vehicle support.',
        price: 14,
        category: 'Protection',
        selected: false
      },
      {
        id: 5,
        name: 'Child seat',
        description: 'Suitable child seat prepared with the vehicle.',
        price: 12,
        category: 'Equipment',
        selected: false
      },
      {
        id: 6,
        name: 'Booster seat',
        description: 'Booster seat for older children.',
        price: 9,
        category: 'Equipment',
        selected: false
      },
      {
        id: 7,
        name: 'GPS navigation',
        description: 'Portable navigation unit for the rental period.',
        price: 10,
        category: 'Equipment',
        selected: false
      },
      {
        id: 8,
        name: 'Wi-Fi hotspot',
        description: 'In-car mobile hotspot for passengers.',
        price: 11,
        category: 'Equipment',
        selected: false
      },
      {
        id: 9,
        name: 'Door delivery',
        description: 'Deliver the vehicle to the selected local address.',
        price: 35,
        category: 'Convenience',
        selected: false
      },
      {
        id: 10,
        name: 'Airport meet and greet',
        description: 'A branch representative meets you at arrivals.',
        price: 28,
        category: 'Convenience',
        selected: false
      },
      {
        id: 11,
        name: 'Prepaid fuel',
        description: 'Return the vehicle without refuelling.',
        price: 45,
        category: 'Convenience',
        selected: false
      }
    ];
  }

  private createBookingReference(make: string, model: string): string {
    const makePart = String(make || 'CAR').slice(0, 3).toUpperCase();
    const modelPart = String(model || 'VEH').replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase();
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

    return `CR-${makePart}-${modelPart}-${datePart}-${randomPart}`;
  }

  private setDefaultDates(): void {
    const today = new Date();
    const pickup = new Date(today);
    pickup.setDate(today.getDate() + 1);

    this.rentDate = this.formatDate(pickup);
    this.rentalLengthDays = 1;
    this.returnDate = this.rentDate;
  }

  private syncRentalLengthFromDates(): void {
    const start = this.parseDate(this.rentDate);
    const end = this.parseDate(this.returnDate);

    if (!start || !end || end < start) {
      this.rentalLengthDays = 0;
      return;
    }

    this.rentalLengthDays = this.daysBetweenInclusive(start, end);
  }

  private addDays(dateValue: string, daysToAdd: number): string {
    const date = this.parseDate(dateValue);

    if (!date) {
      return '';
    }

    date.setDate(date.getDate() + daysToAdd);
    return this.formatDate(date);
  }

  private daysBetweenInclusive(start: Date, end: Date): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
  }

  private parseDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
      return null;
    }

    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}

