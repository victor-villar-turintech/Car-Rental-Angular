import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Car } from 'src/app/models/car';
import { CarImage } from 'src/app/models/carImage';
import { Rental } from 'src/app/models/rental';
import { CarImageService } from 'src/app/services/car-image.service';
import { CarService } from 'src/app/services/car.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({ selector: 'app-car-detail', templateUrl: './car-detail.component.html', styleUrls: ['./car-detail.component.css'] })
export class CarDetailComponent implements OnInit {
  car: Car;
  carImages: CarImage[] = [];
  dataLoaded = false;
  pickupDate = '';
  returnDate = '';
  rentalDays = 0;
  totalPrice = 0;
  today = new Date().toISOString().slice(0, 10);
  availabilityChecked = false;
  availableForSelectedDates = true;
  availabilityMessage = 'Select dates to check availability.';

  constructor(
    private carService: CarService,
    private carImageService: CarImageService,
    private rentalService: RentalService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const carId = params.carId || params.id;
      if (carId) {
        this.getCarDetail(carId);
        this.getImagesByCarId(carId);
      }
    });
  }

  getCarDetail(carId: number): void {
    this.carService.getCarById(carId).subscribe((response) => {
      this.car = response.data;
      this.dataLoaded = true;
    });
  }

  getImagesByCarId(carId: number): void {
    this.carImageService.getCarImages(carId).subscribe((response) => {
      this.carImages = response.data;
    });
  }

  getMainImage(): string {
    return this.carImages.length > 0 ? this.carImages[0].imagePath : this.car.imagePath;
  }

  updateRentalEstimate(): void {
    if (!this.car || !this.pickupDate || !this.returnDate) {
      this.rentalDays = 0;
      this.totalPrice = 0;
      this.availabilityChecked = false;
      this.availableForSelectedDates = true;
      this.availabilityMessage = 'Select dates to check availability.';
      return;
    }

    const start = new Date(this.pickupDate);
    const end = new Date(this.returnDate);
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.ceil((end.getTime() - start.getTime()) / dayMs) + 1;

    if (days <= 0) {
      this.rentalDays = 0;
      this.totalPrice = 0;
      this.availabilityChecked = true;
      this.availableForSelectedDates = false;
      this.availabilityMessage = 'Return date must be the same day or after pickup date.';
      return;
    }

    this.rentalDays = days;
    this.totalPrice = days * this.car.dailyPrice;
    this.checkAvailability();
  }

  checkAvailability(): void {
    if (!this.car || !this.pickupDate || !this.returnDate || this.rentalDays <= 0) {
      return;
    }

    const rental: Rental = {
      carId: this.car.carId,
      rentDate: this.pickupDate,
      returnDate: this.returnDate,
    };

    this.rentalService.isRentable(rental).subscribe((response) => {
      this.availabilityChecked = true;
      this.availableForSelectedDates = response.success;
      this.availabilityMessage = response.message;
    });
  }

  rentThisCar(): void {
    if (this.pickupDate && this.returnDate && !this.availableForSelectedDates) {
      return;
    }

    const queryParams = this.pickupDate && this.returnDate
      ? { pickupDate: this.pickupDate, returnDate: this.returnDate }
      : {};

    this.router.navigate(['/car/rental', this.car.carId], { queryParams });
  }

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
    const colours: { [key: string]: string } = {
      Black: '#111827', White: '#f8fafc', Grey: '#64748b', Blue: '#2563eb', Red: '#dc2626',
      Silver: '#cbd5e1', Green: '#15803d', Orange: '#f97316', Yellow: '#facc15', Navy: '#1e3a8a',
      Bronze: '#a16207', Burgundy: '#7f1d1d'
    };
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

  private buildFallbackImage(car: Car): string {
    const label = `${car.colorName || ''} ${car.brandName || ''} ${car.carName || 'Vehicle'}`.trim();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
      <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#e2e8f0"/><stop offset="1" stop-color="#bfdbfe"/></linearGradient></defs>
      <rect width="1200" height="720" fill="url(#g)"/>
      <rect x="170" y="330" width="860" height="150" rx="55" fill="#0f172a" opacity="0.9"/>
      <circle cx="360" cy="500" r="62" fill="#f8fafc"/><circle cx="840" cy="500" r="62" fill="#f8fafc"/>
      <text x="600" y="245" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="800" fill="#0f172a">Image unavailable</text>
      <text x="600" y="305" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="#334155">${label}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}
