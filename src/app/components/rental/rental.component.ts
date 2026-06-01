import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
import { FavouriteVehicleService } from '../../services/favourite-vehicle.service';

@Component({ selector: 'app-rental', templateUrl: './rental.component.html', styleUrls: ['./rental.component.css'] })
export class RentalComponent implements OnInit {
  car: Car;
  currentCustomer: Customer | undefined;
  rentalForm: UntypedFormGroup;
  pickupDate = '';
  returnDate = '';
  rentalDays = 0;
  vehicleSubtotal = 0;
  extrasTotal = 0;
  rentPrice = 0;
  rental: Rental;
  rentable = true;
  availabilityMessage = 'Select valid pickup and return dates to check availability.';
  pickupLocation = 'Central London branch';
  pickupLocationId = 'central-london';
  airportTerminal = '';
  pickupLocations: PickupLocationOption[] = [];
  bookingExtras: BookingExtraSelection[] = [];
  bookingConfirmed = false;
  confirmedBooking: Rental;
  today = new Date().toISOString().slice(0, 10);
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

  constructor(private fb: UntypedFormBuilder,
    private rentalService: RentalService,
    private carService: CarService,
    private bookingExtraService: BookingExtraService,
    private pickupLocationService: PickupLocationService,
    private pricingService: PricingService,
    private customerAuthService: CustomerAuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService, private favouriteVehicleService: FavouriteVehicleService) {
    this.rentalForm = this.fb.group({
      pickupLocationId: ['central-london', [Validators.required]],
      pickupDate: ['', [Validators.required]],
      durationPreset: ['1', [Validators.required]],
      customRentalDays: [1, [Validators.min(1)]],
      returnDate: ['', [Validators.required]],
      customerName: ['Demo User', [Validators.required, Validators.minLength(2)]],
      customerEmail: ['demo.user@example.com', [Validators.required, Validators.email]],
      customerPhone: ['07123 456789', [Validators.pattern(/^[0-9 +()-]{7,20}$/)]],
    });
  }

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
      if (params.pickupDate || params.returnDate) {
        this.rentalForm.patchValue({ pickupDate: params.pickupDate || this.rentalForm.value.pickupDate, returnDate: params.returnDate || this.rentalForm.value.returnDate });
        this.syncDurationFromDates();
        this.calculatePrice();
      }
    });
  }

  get f() { return this.rentalForm.controls; }
  get selectedExtras(): BookingExtraSelection[] { return this.bookingExtras.filter((extra) => extra.selected); }

  getCarDetail(carId: number): void {
    this.carService.getCarById(carId).subscribe((response) => {
      this.car = response.data;
      this.applyDurationToReturnDate(false);
      this.calculatePrice();
    });
  }

  loadLoggedInCustomer(): void {
    this.currentCustomer = this.customerAuthService.getCurrentCustomer();
    if (!this.currentCustomer) return;
    this.rentalForm.patchValue({ customerName: `${this.currentCustomer.firstName} ${this.currentCustomer.lastName}`.trim(), customerEmail: this.currentCustomer.email, customerPhone: this.currentCustomer.phone || this.rentalForm.value.customerPhone });
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
    if (!this.rentalForm.value.pickupDate) {
      this.rentalForm.patchValue({ returnDate: '' });
      this.calculatePrice();
      return;
    }
    if (!this.rentalForm.value.returnDate || new Date(this.rentalForm.value.returnDate) < new Date(this.rentalForm.value.pickupDate)) {
      this.rentalForm.patchValue({ returnDate: this.rentalForm.value.pickupDate, durationPreset: '1', customRentalDays: 1 });
    }
    this.applyDurationToReturnDate(false);
    this.calculatePrice();
  }

  onReturnDateChange(): void {
    if (this.rentalForm.value.pickupDate && this.rentalForm.value.returnDate && new Date(this.rentalForm.value.returnDate) < new Date(this.rentalForm.value.pickupDate)) {
      this.rentalForm.patchValue({ returnDate: this.rentalForm.value.pickupDate });
    }
    this.syncDurationFromDates();
    this.calculatePrice();
  }

  onDurationChange(): void {
    this.applyDurationToReturnDate(true);
    this.calculatePrice();
  }

  onCustomRentalDaysChange(): void {
    if (this.rentalForm.value.durationPreset !== 'custom') return;
    this.applyDurationToReturnDate(true);
    this.calculatePrice();
  }

  onExtraToggle(extra: BookingExtraSelection): void {
    extra.selected = !extra.selected;
    if (!extra.quantity || extra.quantity < 1) extra.quantity = 1;
    this.calculatePrice();
  }

  onPickupLocationChange(): void {
    this.syncPickupLocation();
    this.calculatePrice();
  }

  confirmBooking(): void {
    this.rentalForm.markAllAsTouched();
    this.calculatePrice();
    if (this.rentalForm.invalid || !this.rental) {
      this.toastrService.error('Complete the required booking fields before confirming.', 'Invalid booking');
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
    this.syncFormFields();
    if (!this.car || !this.pickupDate || !this.returnDate) {
      this.vehicleSubtotal = this.extrasTotal = this.rentPrice = this.rentalDays = 0;
      this.rental = undefined;
      this.rentable = true;
      this.availabilityMessage = 'Select valid pickup and return dates to check availability.';
      return;
    }
    const days = this.pricingService.calculateRentalDays(this.pickupDate, this.returnDate);
    if (days <= 0) {
      this.vehicleSubtotal = this.extrasTotal = this.rentPrice = this.rentalDays = 0;
      this.rental = undefined;
      this.rentable = false;
      this.availabilityMessage = 'Return date must be the same day or after pickup date.';
      return;
    }
    this.rentalDays = days;
    this.bookingExtras = this.bookingExtras.map((extra) => ({ ...extra, totalPrice: extra.selected ? this.pricingService.calculateExtraTotal(extra, days) : 0 }));
    const selectedExtras = this.selectedExtras;
    this.vehicleSubtotal = this.pricingService.calculateVehicleSubtotal(this.car.dailyPrice, days);
    this.extrasTotal = this.pricingService.calculateExtrasSubtotal(selectedExtras, days);
    this.rentPrice = this.vehicleSubtotal + this.extrasTotal;
    const formValue = this.rentalForm.value;
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
      customerName: formValue.customerName,
      customerEmail: formValue.customerEmail,
      customerPhone: formValue.customerPhone,
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
    if (!reference) return;
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
  goToPayment(): void { const reference = this.confirmedBooking?.bookingReference; if (reference) this.router.navigate(['/payment', reference]); }
  goToRegister(): void { this.router.navigate(['/register'], { queryParams: { returnUrl: this.router.url } }); }

  getVehicleCategory(car: Car): string {
    const text = `${car.carName} ${car.description}`.toLowerCase();
    if (text.includes('electric') || text.includes('ev')) return 'Electric';
    if (text.includes('suv') || text.includes('crossover') || text.includes('qashqai') || text.includes('sportage')) return 'SUV';
    if (text.includes('estate') || text.includes('touring')) return 'Estate';
    if (text.includes('hatch') || text.includes('golf') || text.includes('focus')) return 'Hatchback';
    if (text.includes('premium') || text.includes('executive') || text.includes('mercedes') || text.includes('bmw') || text.includes('audi')) return 'Premium';
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

  private syncFormFields(): void {
    const formValue = this.rentalForm.value;
    this.pickupDate = formValue.pickupDate || '';
    this.returnDate = formValue.returnDate || '';
    this.pickupLocationId = formValue.pickupLocationId || 'central-london';
  }

  private syncPickupLocation(): void {
    this.syncFormFields();
    const selected = this.pickupLocations.find((location) => location.id === this.pickupLocationId) || this.pickupLocations[0];
    if (!selected) return;
    this.pickupLocationId = selected.id;
    this.pickupLocation = selected.label;
    this.rentalForm.patchValue({ pickupLocationId: selected.id }, { emitEvent: false });
    this.airportTerminal = selected.type === 'Airport' ? selected.label : '';
    const airportExtra = this.bookingExtras.find((extra) => extra.category === 'Pickup');
    if (airportExtra) {
      airportExtra.selected = selected.type === 'Airport';
      airportExtra.price = selected.surcharge || airportExtra.price;
      airportExtra.quantity = 1;
    }
  }

  private applyDurationToReturnDate(forceUpdate: boolean): void {
    const pickupDate = this.rentalForm.value.pickupDate;
    if (!pickupDate) return;
    const days = this.getSelectedDurationDays();
    if (!days || days < 1) return;
    if (!forceUpdate && this.rentalForm.value.returnDate && new Date(this.rentalForm.value.returnDate) >= new Date(pickupDate)) return;
    this.rentalForm.patchValue({ returnDate: this.addDays(pickupDate, days - 1) });
  }

  private syncDurationFromDates(): void {
    const pickupDate = this.rentalForm.value.pickupDate;
    const returnDate = this.rentalForm.value.returnDate;
    if (!pickupDate || !returnDate) return;
    const days = this.pricingService.calculateRentalDays(pickupDate, returnDate);
    if (days < 1) return;
    const presetValues = this.durationOptions.filter((option) => option.value !== 'custom').map((option) => option.value);
    this.rentalForm.patchValue({ durationPreset: presetValues.includes(String(days)) ? String(days) : 'custom', customRentalDays: presetValues.includes(String(days)) ? 1 : days }, { emitEvent: false });
  }

  private getSelectedDurationDays(): number {
    return this.rentalForm.value.durationPreset === 'custom' ? Math.max(1, Number(this.rentalForm.value.customRentalDays || 1)) : Number(this.rentalForm.value.durationPreset || 1);
  }

  private addDays(dateValue: string, daysToAdd: number): string {
    const date = new Date(dateValue);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().slice(0, 10);
  }

  private buildFallbackImage(car: Car): string {
    const label = `${car.colorName || ''} ${car.brandName || ''} ${car.carName || 'Vehicle'}`.trim();
    const svg = `Image unavailable${label}`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  private readonly favouriteVehicleStorageKey = 'rentacar-favourite-car-ids';

  get rentalFavouriteCarId(): number {
    const carLike: any = this.car || {};
    return Number(carLike.carId || carLike.id || 0);
  }

  isRentalCarFavourite(): boolean {
    const carId = this.rentalFavouriteCarId;
    if (!carId) {
      return false;
    }

    return this.getFavouriteVehicleIds().includes(carId);
  }

  toggleRentalFavourite(): void {
    const carId = this.rentalFavouriteCarId;
    if (!carId) {
      return;
    }

    const ids = this.getFavouriteVehicleIds();
    const nextIds = ids.includes(carId)
      ? ids.filter((id) => id !== carId)
      : [...ids, carId];

    localStorage.setItem(this.favouriteVehicleStorageKey, JSON.stringify(nextIds));
  }

  private getFavouriteVehicleIds(): number[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.favouriteVehicleStorageKey) || '[]');
      return Array.isArray(parsed)
        ? parsed.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0)
        : [];
    } catch {
      return [];
    }
  }

get selectedVehicleId(): number {
    return Number((this as any).car?.carId || (this as any).car?.id || (this as any).carId || 0);
  }

  get favouriteActionLabel(): string {
    return this.isCurrentVehicleFavourite() ? 'Saved to favourites' : 'Add to favourites';
  }

  isCurrentVehicleFavourite(): boolean {
    return this.favouriteVehicleService.isFavourite(this.selectedVehicleId);
  }

  toggleCurrentVehicleFavourite(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.favouriteVehicleService.toggleFavourite(this.selectedVehicleId);
  }
}
