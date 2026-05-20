import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Car } from 'src/app/models/car';
import { Rental } from 'src/app/models/rental';
import { CarService } from 'src/app/services/car.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({ selector: 'app-rental', templateUrl: './rental.component.html', styleUrls: ['./rental.component.css'] })
export class RentalComponent implements OnInit {
  car: Car;
  pickupDate = '';
  returnDate = '';
  rentalDays = 0;
  rentPrice = 0;
  rental: Rental;
  rentable = true;
  customerName = 'Demo User';
  customerEmail = 'demo.user@example.com';
  customerPhone = '07123 456789';
  pickupLocation = 'Central London branch';
  bookingConfirmed = false;
  confirmedBooking: Rental;
  today = new Date().toISOString().slice(0, 10);

  constructor(
    private rentalService: RentalService,
    private carService: CarService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params.carId) {
        this.getCarDetail(params.carId);
      }
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      this.pickupDate = params.pickupDate || this.pickupDate;
      this.returnDate = params.returnDate || this.returnDate;
      this.calculatePrice();
    });
  }

  getCarDetail(carId: number): void {
    this.carService.getCarById(carId).subscribe((response) => {
      this.car = response.data;
      this.calculatePrice();
    });
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
      if (!this.rentable) {
        this.toastrService.error(response.message, 'Already booked');
        return;
      }

      this.rentalService.addRental(this.rental).subscribe(() => {
        this.confirmedBooking = this.rental;
        this.bookingConfirmed = true;
        this.toastrService.success('Your demo booking has been saved locally.', 'Booking confirmed');
      });
    });
  }

  calculatePrice(): void {
    if (!this.car || !this.pickupDate || !this.returnDate) {
      this.rentPrice = 0;
      this.rentalDays = 0;
      this.rental = undefined;
      return;
    }

    const start = new Date(this.pickupDate);
    const end = new Date(this.returnDate);
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.ceil((end.getTime() - start.getTime()) / dayMs) + 1;

    if (days <= 0) {
      this.rentPrice = 0;
      this.rentalDays = 0;
      this.rental = undefined;
      return;
    }

    this.rentalDays = days;
    this.rentPrice = days * this.car.dailyPrice;
    this.rental = {
      carId: this.car.carId,
      carName: this.car.carName,
      brandName: this.car.brandName,
      colorName: this.car.colorName,
      modelYear: this.car.modelYear,
      dailyPrice: this.car.dailyPrice,
      imagePath: this.car.imagePath,
      rentDate: this.pickupDate,
      returnDate: this.returnDate,
      rentalDays: this.rentalDays,
      totalRentPrice: this.rentPrice,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone,
      pickupLocation: this.pickupLocation,
      status: 'Confirmed',
    };
  }

  goToCars(): void {
    this.router.navigate(['/cars']);
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
    if (target.dataset.fallbackApplied === 'true') {
      target.alt = `${car.colorName} ${car.brandName} ${car.carName} image unavailable`;
      target.style.display = 'none';
      return;
    }

    target.dataset.fallbackApplied = 'true';
    const prompt = encodeURIComponent(
      `realistic high quality dealership photograph of a ${car.colorName} ${car.modelYear} ${car.brandName} ${car.carName}, exact exterior colour ${car.colorName}, front three quarter view, clean London street background, natural daylight, no text, no watermark, no logo overlay`
    );
    target.src = `https://image.pollinations.ai/prompt/${prompt}?width=900&height=520&seed=${car.carId + 1000}&nologo=true&private=true&enhance=true`;
  }
}
