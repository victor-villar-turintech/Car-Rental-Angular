import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Car } from 'src/app/models/car';
import { Rental } from 'src/app/models/rental';
import { CarService } from 'src/app/services/car.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-rental',
  templateUrl: './rental.component.html',
  styleUrls: ['./rental.component.css']
})
export class RentalComponent implements OnInit {
  car: Car;
  startDate: Date;
  endDate: Date;
  rentPrice = 0;
  rental: Rental;
  rentable = true;

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
  }

  getCarDetail(carId: number): void {
    this.carService.getCarById(carId).subscribe((response) => {
      this.car = response.data;
    });
  }

  addRental(rental: Rental): void {
    if (!rental) {
      this.toastrService.error('Select valid rental dates before continuing.', 'Invalid rental');
      return;
    }

    this.rentalService.isRentable(rental).subscribe((response) => {
      this.rentable = response.success;
      if (this.rentable) {
        this.router.navigate(['/creditcard', JSON.stringify(rental)]);
        this.toastrService.info('Redirecting to credit card payment page', 'Redirecting');
      } else {
        this.toastrService.error('You cannot rent the car between these dates', 'Already rented');
      }
    });
  }

  calculatePrice(): void {
    if (!this.car || !this.startDate || !this.endDate) {
      this.rentPrice = 0;
      this.rental = undefined;
      return;
    }

    const start = new Date(this.startDate.toString());
    const end = new Date(this.endDate.toString());
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.floor((end.getTime() - start.getTime()) / dayMs) + 1;

    if (days <= 0) {
      this.rentPrice = 0;
      this.rental = undefined;
      this.toastrService.info('Return date must be after the start date.', 'Invalid dates');
      return;
    }

    this.rentPrice = days * this.car.dailyPrice;
    this.rental = {
      carId: this.car.carId,
      rentDate: this.startDate,
      returnDate: this.endDate,
      totalRentPrice: this.rentPrice
    };
  }


  getVehicleColourHex(colourName: string): string {
    const colours: { [key: string]: string } = {
      Black: '#111827',
      White: '#f8fafc',
      Grey: '#64748b',
      Blue: '#2563eb',
      Red: '#dc2626',
      Silver: '#cbd5e1',
      Green: '#15803d',
      Orange: '#f97316',
      Yellow: '#facc15',
      Navy: '#1e3a8a',
      Bronze: '#a16207',
      Burgundy: '#7f1d1d'
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
