import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookingExtraSelection } from 'src/app/models/booking-extra';
import { Car } from 'src/app/models/car';
import { Customer } from 'src/app/models/customer';
import { PickupLocationOption } from 'src/app/models/pickup-location';
import { Rental } from 'src/app/models/rental';
import { BookingExtraService } from 'src/app/services/booking-extra.service';
import { CarService } from 'src/app/services/car.service';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';
import { PickupLocationService } from 'src/app/services/pickup-location.service';
import { PricingService } from 'src/app/services/pricing.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({ selector: 'app-rental', templateUrl: './rental.component.html', styleUrls: ['./rental.component.css'] })
export class RentalComponent implements OnInit {
  car: Car;
  currentCustomer: Customer | undefined;
  pickupDate = '';
  returnDate = '';
  rentalDays = 0;
  vehicleSubtotal = 0;
  extrasTotal = 0;
  rentPrice = 0;
  rental: Rental;
  rentable = true;
  availabilityMessage = 'Select valid pickup and return dates to check availability.';
  customerName = 'Demo User';
  customerEmail = 'demo.user@example.com';
  customerPhone = '07123 456789';
  pickupLocation = 'Central London branch';
  pickupLocationId = 'central-london';
  airportTerminal = '';
  pickupLocations: PickupLocationOption[] = [];
  bookingExtras: BookingExtraSelection[] = [];
  bookingConfirmed = false;
  confirmedBooking: Rental;
  today = new Date().toISOString().slice(0, 10);
  durationPreset = '1';
  customRentalDays: number | undefined;
  copiedReference = false;

  durationOptions = [
    { label: '1 day', value: '1' },
    { label: '2 days', value: '2' },
    { label: '3 days', value: '3' },
    { label: '5 days', value: '5' },
    { label: '7 days', value: '7' },
    { label: '14 days', value: '14' },
    { label: 'Custom', value: 'custom' },
  ];

  constructor(
    private rentalService: RentalService,
    private carService: CarService,
    private bookingExtraService: BookingExtraService,
    private pickupLocationService: PickupLocationService,
    private pricingService: PricingService,
    private customerAuthService: CustomerAuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInCustomer();
    this.loadBookingExtras();
    this.loadPickupLocations();

    this.activatedRoute.params.subscribe((params) => {
      if (params.carId) {
        this.getCarDetail(params.carId);
      }
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      this.pickupDate = params.pickupDate || this.pickupDate;
      this.returnDate = params.returnDate || this.returnDate;
      this.syncDurationFromDates();
      this.calculatePrice();
    });
  }

  getCarDetail(carId: number): void {
    this.carService.getCarById(carId).subscribe((response) => {
      this.car = response.data;
      this.applyDurationToReturnDate(false);
      this.calculatePrice();
    });
  }

  loadLoggedInCustomer(): void {
    this.currentCustomer = this.customerAuthService.getCurrentCustomer();
    if (!this.currentCustomer) {
      return;
    }

    this.customerName = `${this.currentCustomer.firstName} ${this.currentCustomer.lastName}`.trim();
    this.customerEmail = this.currentCustomer.email;
    this.customerPhone = this.currentCustomer.phone || this.customerPhone;
  }

  loadBookingExtras(): void {
    this.bookingExtraService.getExtras().subscribe((response) => {
      this.bookingExtras = response.data.map((extra) => ({ ...extra, selected: false, quantity: 1, totalPrice: 0 }));
      this.calculatePrice();
    });
  }

  loadPickupLocations(): void {
    this.pickupLocationService.getPickupLocations().subscribe((response) => {
      this.pickupLocations = response.data;
      this.syncPickupLocation();
    });
  }

  onPickupDateChange(): void {
    if (!this.pickupDate) {
      this.returnDate = '';
      this.calculatePrice();
      return;
    }

    if (!this.returnDate || new Date(this.returnDate) < new Date(this.pickupDate)) {
      this.returnDate = this.pickupDate;
      this.durationPreset = '1';
      this.customRentalDays = undefined;
    }

    this.applyDurationToReturnDate(false);
    this.calculatePrice();
  }

  onReturnDateChange(): void {
    if (this.pickupDate && this.returnDate && new Date(this.returnDate) < new Date(this.pickupDate)) {
      this.returnDate = this.pickupDate;
    }

    this.syncDurationFromDates();
    this.calculatePrice();
  }

  onDurationChange(): void {
    this.applyDurationToReturnDate(true);
    this.calculatePrice();
  }

  onCustomRentalDaysChange(): void {
    if (this.durationPreset !== 'custom') {
      return;
    }

    this.applyDurationToReturnDate(true);
    this.calculatePrice();
  }

  onExtraToggle(extra: BookingExtraSelection): void {
    extra.selected = !extra.selected;
    if (!extra.quantity || extra.quantity < 1) {
      extra.quantity = 1;
    }
    this.calculatePrice();
  }

  onPickupLocationChange(): void {
    this.syncPickupLocation();
    this.calculatePrice();
  }

  confirmBooking(): void {
    this.calculatePrice();

    if (!this.rental) {
      this.toastrService.error('Select valid pickup and return dates before confirming.', 'Invalid booking');
      return;
    }

    if (!this.customerName || !this.customerEmail) {
      this.toastrService.error('Customer name and email are required.', 'Missing customer details');
      return;
    }

    this.rentalService.isRentable(this.rental).subscribe((response) => {
      this.rentable = response.success;
      this.availabilityMessage = response.message;

      if (!this.rentable) {
        this.toastrService.error(response.message, 'Unavailable');
        return;
      }

      this.rentalService.addRental(this.rental).subscribe((saveResponse) => {
        this.confirmedBooking = this.rental;
        this.bookingConfirmed = true;
        this.copiedReference = false;
        this.toastrService.success(saveResponse.message, 'Booking request saved');
      });
    });
  }

  calculatePrice(): void {
    if (!this.car || !this.pickupDate || !this.returnDate) {
      this.vehicleSubtotal = 0;
      this.extrasTotal = 0;
      this.rentPrice = 0;
      this.rentalDays = 0;
      this.rental = undefined;
      this.rentable = true;
      this.availabilityMessage = 'Select valid pickup and return dates to check availability.';
      return;
    }

    const days = this.pricingService.calculateRentalDays(this.pickupDate, this.returnDate);

    if (days <= 0) {
      this.vehicleSubtotal = 0;
      this.extrasTotal = 0;
      this.rentPrice = 0;
      this.rentalDays = 0;
      this.rental = undefined;
      this.rentable = false;
      this.availabilityMessage = 'Return date must be the same day or after pickup date.';
      return;
    }

    this.rentalDays = days;
    this.bookingExtras = this.bookingExtras.map((extra) => ({
      ...extra,
      totalPrice: extra.selected ? this.pricingService.calculateExtraTotal(extra, days) : 0,
    }));
    const selectedExtras = this.bookingExtras.filter((extra) => extra.selected);
    this.vehicleSubtotal = this.pricingService.calculateVehicleSubtotal(this.car.dailyPrice, days);
    this.extrasTotal = this.pricingService.calculateExtrasSubtotal(selectedExtras, days);
    this.rentPrice = this.vehicleSubtotal + this.extrasTotal;

    this.rental = {
      carId: this.car.carId,
      carName: this.car.carName,
      brandName: this.car.brandName,
      colorName: this.car.colorName,
      modelYear: this.car.modelYear,
      dailyPrice: this.car.dailyPrice,
      imagePath: this.car.imagePath,
      numberPlate: this.car.numberPlate,
      rentDate: this.pickupDate,
      returnDate: this.returnDate,
      rentalDays: this.rentalDays,
      vehicleSubtotal: this.vehicleSubtotal,
      extrasTotal: this.extrasTotal,
      totalRentPrice: this.rentPrice,
      selectedExtras,
      customerId: this.currentCustomer?.customerId,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone,
      pickupLocation: this.pickupLocation,
      pickupLocationId: this.pickupLocationId,
      airportTerminal: this.airportTerminal,
      status: 'Pending',
    };

    this.rentalService.isRentable(this.rental).subscribe((response) => {
      this.rentable = response.success;
      this.availabilityMessage = response.message;
    });
  }

  copyBookingReference(): void {
    const reference = this.confirmedBooking?.bookingReference;
    if (!reference) {
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(reference).then(() => {
        this.copiedReference = true;
        this.toastrService.success('Booking reference copied.');
      });
      return;
    }

    this.copiedReference = true;
  }

  goToCars(): void { this.router.navigate(['/cars']); }
  goToBookingLookup(): void { this.router.navigate(['/booking-lookup']); }
  goToRegister(): void { this.router.navigate(['/register'], { queryParams: { returnUrl: this.router.url } }); }

  get selectedExtras(): BookingExtraSelection[] { return this.bookingExtras.filter((extra) => extra.selected); }

  getVehicleCategory(car: Car): string {
    const text = `${car.carName} ${car.description}`.toLowerCase();
    if (text.includes('electric') || text.includes('ev')) { return 'Electric'; }
    if (text.includes('suv') || text.includes('crossover') || text.includes('qashqai') || text.includes('sportage')) { return 'SUV'; }
    if (text.includes('estate') || text.includes('touring')) { return 'Estate'; }
    if (text.includes('hatch') || text.includes('golf') || text.includes('focus')) { return 'Hatchback'; }
    if (text.includes('premium') || text.includes('executive') || text.includes('mercedes') || text.includes('bmw') || text.includes('audi')) { return 'Premium'; }
    return 'Saloon';
  }

  getTransmissionLabel(car: Car): string {
    const text = `${car.carName} ${car.description}`.toLowerCase();
    return text.includes('manual') ? 'Manual' : 'Automatic';
  }

  getVehicleColourHex(colourName: string): string {
    const colours: { [key: string]: string } = { Black: '#111827', White: '#f8fafc', Grey: '#64748b', Blue: '#2563eb', Red: '#dc2626', Silver: '#cbd5e1', Green: '#15803d', Orange: '#f97316', Yellow: '#facc15', Navy: '#1e3a8a', Bronze: '#a16207', Burgundy: '#7f1d1d' };
    return colours[colourName] || '#2563eb';
  }

  getVehicleLabelColour(colourName: string): string {
    return ['White', 'Silver', 'Yellow'].includes(colourName) ? '#0f172a' : '#ffffff';
  }

  handleVehicleImageError(event: Event, car: Car): void {
    const target = event.target as HTMLImageElement;
    target.onerror = null;
    target.src = this.buildFallbackImage(car);
  }

  private syncPickupLocation(): void {
    const selected = this.pickupLocations.find((location) => location.id === this.pickupLocationId) || this.pickupLocations[0];
    if (!selected) { return; }

    this.pickupLocationId = selected.id;
    this.pickupLocation = selected.label;
    this.airportTerminal = selected.type === 'Airport' ? selected.label : '';

    const airportExtra = this.bookingExtras.find((extra) => extra.category === 'Pickup');
    if (airportExtra) {
      airportExtra.selected = selected.type === 'Airport';
      airportExtra.price = selected.surcharge || airportExtra.price;
      airportExtra.quantity = 1;
    }
  }

  private applyDurationToReturnDate(forceUpdate: boolean): void {
    if (!this.pickupDate) { return; }
    const days = this.getSelectedDurationDays();
    if (!days || days < 1) { return; }
    if (!forceUpdate && this.returnDate && new Date(this.returnDate) >= new Date(this.pickupDate)) { return; }
    this.returnDate = this.addDays(this.pickupDate, days - 1);
  }

  private syncDurationFromDates(): void {
    if (!this.pickupDate || !this.returnDate) { return; }
    const days = this.daysBetweenInclusive(this.pickupDate, this.returnDate);
    if (days < 1) { return; }
    const presetValues = this.durationOptions.filter((option) => option.value !== 'custom').map((option) => option.value);
    this.durationPreset = presetValues.includes(String(days)) ? String(days) : 'custom';
    this.customRentalDays = this.durationPreset === 'custom' ? days : undefined;
  }

  private getSelectedDurationDays(): number {
    return this.durationPreset === 'custom' ? Math.max(1, Number(this.customRentalDays || 1)) : Number(this.durationPreset || 1);
  }

  private daysBetweenInclusive(startDate: string, endDate: string): number {
    return this.pricingService.calculateRentalDays(startDate, endDate);
  }

  private addDays(dateValue: string, daysToAdd: number): string {
    const date = new Date(dateValue);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().slice(0, 10);
  }

  private buildFallbackImage(car: Car): string {
    const label = `${car.colorName || ''} ${car.brandName || ''} ${car.carName || 'Vehicle'}`.trim();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="#e2e8f0"/><rect x="170" y="330" width="860" height="150" rx="55" fill="#0f172a" opacity="0.9"/><circle cx="360" cy="500" r="62" fill="#f8fafc"/><circle cx="840" cy="500" r="62" fill="#f8fafc"/><text x="600" y="245" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="800" fill="#0f172a">Image unavailable</text><text x="600" y="305" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="#334155">${label}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}
