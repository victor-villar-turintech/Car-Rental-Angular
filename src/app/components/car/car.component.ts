import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Car } from 'src/app/models/car';
import { CarService } from 'src/app/services/car.service';

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.css']
})
export class CarComponent implements OnInit {
  cars: Car[] = [];
  dataLoaded = false;
  carFilter = '';

  constructor(
    private carService: CarService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.dataLoaded = false;

      if (params.brandId && params.colorId) {
        this.getCarsBySelect(params.brandId, params.colorId);
      } else if (params.colorId) {
        this.getCarsByColor(params.colorId);
      } else if (params.brandId) {
        this.getCarsByBrand(params.brandId);
      } else {
        this.getCars();
      }
    });
  }

  get filteredCars(): Car[] {
    const query = this.normalise(this.carFilter);
    if (!query) {
      return this.cars;
    }

    return this.cars.filter((car) => {
      const searchable = [
        car.brandName,
        car.carName,
        car.colorName,
        car.description,
        car.modelYear?.toString(),
        car.dailyPrice?.toString()
      ].map((value) => this.normalise(value || '')).join(' ');

      return searchable.includes(query);
    });
  }

  getCars(): void {
    this.carService.getCars().subscribe((response) => {
      this.cars = response.data;
      this.dataLoaded = true;
    });
  }

  getCarsByBrand(brandId: number): void {
    this.carService.getCarsByBrand(brandId).subscribe((response) => {
      this.cars = response.data;
      this.dataLoaded = true;
    });
  }

  getCarsByColor(colorId: number): void {
    this.carService.getCarsByColor(colorId).subscribe((response) => {
      this.cars = response.data;
      this.dataLoaded = true;
    });
  }

  getCarsBySelect(brandId: number, colorId: number): void {
    this.carService.getCarsBySelect(brandId, colorId).subscribe((response) => {
      this.cars = response.data;
      this.dataLoaded = true;
    });
  }

  clearSearch(): void {
    this.carFilter = '';
  }

  private normalise(value: string): string {
    return value.toLowerCase().trim();
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
