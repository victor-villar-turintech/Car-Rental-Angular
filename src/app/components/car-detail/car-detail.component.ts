import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Car } from 'src/app/models/car';
import { CarImage } from 'src/app/models/carImage';
import { CarImageService } from 'src/app/services/car-image.service';
import { CarService } from 'src/app/services/car.service';

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

  constructor(
    private carService: CarService,
    private carImageService: CarImageService,
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
      return;
    }

    const start = new Date(this.pickupDate);
    const end = new Date(this.returnDate);
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.ceil((end.getTime() - start.getTime()) / dayMs) + 1;

    if (days <= 0) {
      this.rentalDays = 0;
      this.totalPrice = 0;
      return;
    }

    this.rentalDays = days;
    this.totalPrice = days * this.car.dailyPrice;
  }

  rentThisCar(): void {
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
