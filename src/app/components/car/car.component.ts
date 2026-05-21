import { FavouriteVehicleService } from '../../services/favourite-vehicle.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Car } from 'src/app/models/car';
import { CarService } from 'src/app/services/car.service';

@Component({ selector: 'app-car', templateUrl: './car.component.html', styleUrls: ['./car.component.css'] })
export class CarComponent implements OnInit {
  cars: Car[] = [];
  dataLoaded = false;
  carFilter = '';
  selectedBrand = '';
  selectedColour = '';
  minPrice: number;
  maxPrice: number;
  sortBy = 'priceAsc';

  constructor(private carService: CarService, private activatedRoute: ActivatedRoute,
    private favouriteVehicleService: FavouriteVehicleService) {}

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

  get brands(): string[] {
    return this.uniqueSorted(this.cars.map((car) => car.brandName));
  }

  get colours(): string[] {
    return this.uniqueSorted(this.cars.map((car) => car.colorName));
  }

  get filteredCars(): Car[] {
    const query = this.normalise(this.carFilter);
    const minPrice = Number(this.minPrice || 0);
    const maxPrice = Number(this.maxPrice || 0);

    const filtered = this.cars.filter((car) => {
      const searchable = [
        car.brandName,
        car.carName,
        car.colorName,
        car.description,
        car.modelYear?.toString(),
        car.dailyPrice?.toString(),
        this.getVehicleCategory(car),
        this.getTransmissionLabel(car),
      ]
        .map((value) => this.normalise(value || ''))
        .join(' ');

      const matchesQuery = !query || searchable.includes(query);
      const matchesBrand = !this.selectedBrand || car.brandName === this.selectedBrand;
      const matchesColour = !this.selectedColour || car.colorName === this.selectedColour;
      const matchesMinPrice = !minPrice || car.dailyPrice >= minPrice;
      const matchesMaxPrice = !maxPrice || car.dailyPrice <= maxPrice;

      return matchesQuery && matchesBrand && matchesColour && matchesMinPrice && matchesMaxPrice;
    });

    return filtered.sort((a, b) => this.sortCars(a, b));
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
    this.selectedBrand = '';
    this.selectedColour = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.sortBy = 'priceAsc';
  }

  getVehicleCategory(car: Car): string {
    const text = `${car.carName} ${car.description}`.toLowerCase();

    if (text.includes('electric') || text.includes('ev')) {
      return 'Electric';
    }
    if (text.includes('suv') || text.includes('crossover') || text.includes('qashqai') || text.includes('sportage')) {
      return 'SUV';
    }
    if (text.includes('estate') || text.includes('touring')) {
      return 'Estate';
    }
    if (text.includes('hatch') || text.includes('golf') || text.includes('focus')) {
      return 'Hatchback';
    }
    if (text.includes('premium') || text.includes('executive') || text.includes('mercedes') || text.includes('bmw') || text.includes('audi')) {
      return 'Premium';
    }
    return 'Saloon';
  }

  getTransmissionLabel(car: Car): string {
    const text = `${car.carName} ${car.description}`.toLowerCase();
    return text.includes('manual') ? 'Manual' : 'Automatic';
  }

  private sortCars(a: Car, b: Car): number {
    switch (this.sortBy) {
      case 'priceDesc':
        return b.dailyPrice - a.dailyPrice;
      case 'brandAsc':
        return a.brandName.localeCompare(b.brandName) || a.carName.localeCompare(b.carName);
      case 'yearDesc':
        return b.modelYear - a.modelYear;
      case 'yearAsc':
        return a.modelYear - b.modelYear;
      case 'priceAsc':
      default:
        return a.dailyPrice - b.dailyPrice;
    }
  }

  private uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }

  private normalise(value: string): string {
    return value.toLowerCase().trim();
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
      <rect width="1200" height="720" fill="#e2e8f0"/>
      <rect x="170" y="330" width="860" height="150" rx="55" fill="#0f172a" opacity="0.9"/>
      <circle cx="360" cy="500" r="62" fill="#f8fafc"/><circle cx="840" cy="500" r="62" fill="#f8fafc"/>
      <text x="600" y="245" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="800" fill="#0f172a">Image unavailable</text>
      <text x="600" y="305" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="#334155">${label}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }


  carIdOf(car: any): number {
    return Number(car?.carId || car?.id || 0);
  }

  isFavouriteVehicle(car: any): boolean {
    return this.favouriteVehicleService.isFavourite(this.carIdOf(car));
  }

  toggleFavouriteVehicle(car: any, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.favouriteVehicleService.toggleFavourite(this.carIdOf(car));
  }

  trackRecentlyViewedVehicle(car: any): void {
    this.favouriteVehicleService.addRecentlyViewed(this.carIdOf(car));
  }

getVehicleId(car: any): number {
    return Number(car?.carId || car?.id || car?.vehicleId || 0);
  }

  isFavourite(car: any): boolean {
    return this.favouriteVehicleService.isFavourite(this.getVehicleId(car));
  }

  toggleFavourite(car: any, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.favouriteVehicleService.toggleFavourite(this.getVehicleId(car));
  }
}
