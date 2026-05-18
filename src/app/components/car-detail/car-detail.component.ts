import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Car } from 'src/app/models/car';
import { CarImage } from 'src/app/models/carImage';
import { CarImageService } from 'src/app/services/car-image.service';
import { CarService } from 'src/app/services/car.service';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css']
})
export class CarDetailComponent implements OnInit {
  car: Car;
  carImages: CarImage[] = [];
  dataLoaded = false;

  constructor(
    private carService: CarService,
    private carImageService: CarImageService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params.carId) {
        this.getCarDetail(params.carId);
        this.getImagesByCarId(params.carId);
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
