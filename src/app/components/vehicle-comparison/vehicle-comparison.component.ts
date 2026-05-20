import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from 'src/app/services/car.service';

interface VehicleMetricProfile {
  engineSize: string;
  horsepower: number;
  estimatedRangeMiles: number;
  seats: number;
  luggageCapacityLitres: number;
  bootCapacityLitres: number;
  drivetrain: string;
  fuelEconomyMpg: number;
  fuelType: string;
  co2Band: string;
  size: string;
  vehicleType: string;
}

@Component({
  selector: 'app-vehicle-comparison',
  templateUrl: './vehicle-comparison.component.html',
  styleUrls: ['./vehicle-comparison.component.css']
})
export class VehicleComparisonComponent implements OnInit {
  readonly maxCompareVehicles = 5;

  cars: any[] = [];
  selectedIds: number[] = [];

  searchTerm = '';
  selectedSize = '';
  selectedType = '';
  selectedSeats = '';
  selectedTransmission = '';
  selectedFuelType = '';
  maxDailyPrice: number | null = null;

  availableSizes: string[] = [];
  availableTypes: string[] = [];
  availableSeats: number[] = [];
  availableTransmissions: string[] = [];
  availableFuelTypes: string[] = [];

  constructor(
    private readonly carService: CarService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  private loadCars(): void {
    const source: any = (this.carService as any).getCarsDetails
      ? (this.carService as any).getCarsDetails()
      : (this.carService as any).getCars();

    source.subscribe((response: any) => {
      this.cars = Array.isArray(response) ? response : (response?.data || []);
      this.populateFilterOptions();
      this.route.queryParams.subscribe((params) => {
        const addId = Number(params['add']);
        if (addId && this.cars.some((car) => this.carId(car) === addId)) {
          this.addToCompare(addId, false);
        }
      });
    });
  }

  get filteredCars(): any[] {
    const search = this.normalise(this.searchTerm);
    const maxPrice = Number(this.maxDailyPrice || 0);

    return this.cars.filter((car) => {
      const metrics = this.metrics(car);
      const haystack = this.normalise([
        this.brandName(car),
        this.carName(car),
        this.description(car),
        this.category(car),
        this.transmission(car),
        this.colour(car),
        metrics.vehicleType,
        metrics.size,
        metrics.fuelType,
        metrics.drivetrain
      ].join(' '));

      return (!search || haystack.includes(search))
        && (!this.selectedSize || metrics.size === this.selectedSize)
        && (!this.selectedType || metrics.vehicleType === this.selectedType)
        && (!this.selectedSeats || metrics.seats === Number(this.selectedSeats))
        && (!this.selectedTransmission || this.transmission(car) === this.selectedTransmission)
        && (!this.selectedFuelType || metrics.fuelType === this.selectedFuelType)
        && (!maxPrice || this.dailyPrice(car) <= maxPrice);
    });
  }

  get selectedCars(): any[] {
    return this.selectedIds
      .map((id) => this.cars.find((car) => this.carId(car) === id))
      .filter(Boolean);
  }

  get canAddMore(): boolean {
    return this.selectedIds.length < this.maxCompareVehicles;
  }

  onFilterChange(): void {
    // Bound by the template so Angular change detection recalculates filteredCars.
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSize = '';
    this.selectedType = '';
    this.selectedSeats = '';
    this.selectedTransmission = '';
    this.selectedFuelType = '';
    this.maxDailyPrice = null;
  }

  addToCompare(carId: number, scroll = true): void {
    if (this.selectedIds.includes(carId) || this.selectedIds.length >= this.maxCompareVehicles) {
      return;
    }

    this.selectedIds = [...this.selectedIds, carId];

    if (scroll) {
      setTimeout(() => this.goToComparison(), 50);
    }
  }

  removeFromCompare(carId: number): void {
    this.selectedIds = this.selectedIds.filter((id) => id !== carId);
  }

  resetComparison(): void {
    this.selectedIds = [];
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  goToComparison(): void {
    const section = document.getElementById('comparison-dashboard');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  isSelected(carId: number): boolean {
    return this.selectedIds.includes(carId);
  }

  populateFilterOptions(): void {
    this.availableSizes = this.unique(this.cars.map((car) => this.metrics(car).size));
    this.availableTypes = this.unique(this.cars.map((car) => this.metrics(car).vehicleType));
    this.availableSeats = this.unique(this.cars.map((car) => this.metrics(car).seats)).sort((a, b) => a - b);
    this.availableTransmissions = this.unique(this.cars.map((car) => this.transmission(car)));
    this.availableFuelTypes = this.unique(this.cars.map((car) => this.metrics(car).fuelType));
  }

  carId(car: any): number { return Number(car?.carId ?? car?.id ?? 0); }
  brandName(car: any): string { return car?.brandName || car?.brand?.brandName || car?.brand || 'Unknown brand'; }
  carName(car: any): string { return car?.carName || car?.model || car?.name || 'Vehicle'; }
  description(car: any): string { return car?.description || `${this.category(car)} with ${this.transmission(car).toLowerCase()} transmission.`; }
  dailyPrice(car: any): number { return Number(car?.dailyPrice ?? car?.price ?? car?.dailyRentalPrice ?? 0); }
  imagePath(car: any): string { return car?.imagePath || car?.imageUrl || car?.image || 'assets/img/default-car.png'; }
  colour(car: any): string { return car?.colorName || car?.colourName || car?.color || car?.colour || 'Mixed'; }
  category(car: any): string { return car?.category || car?.bodyType || car?.carType || this.deriveType(car); }
  transmission(car: any): string { return car?.transmission || car?.transmissionType || 'Automatic'; }

  metrics(car: any): VehicleMetricProfile {
    const name = this.normalise(`${this.brandName(car)} ${this.carName(car)} ${this.description(car)} ${this.category(car)}`);
    const electric = name.includes('tesla') || name.includes('electric') || name.includes('ev') || name.includes('id.4') || name.includes('leaf');
    const hybrid = name.includes('hybrid') || name.includes('recharge') || name.includes('prius');
    const suv = name.includes('suv') || name.includes('x3') || name.includes('qashqai') || name.includes('kuga') || name.includes('sport') || name.includes('velar') || name.includes('tiguan') || name.includes('glc') || name.includes('q5');
    const estate = name.includes('estate') || name.includes('touring') || name.includes('avant');
    const hatchback = name.includes('hatchback') || name.includes('golf') || name.includes('focus') || name.includes('picanto') || name.includes('208') || name.includes('clio');
    const premium = this.dailyPrice(car) >= 115;

    const vehicleType = car?.vehicleType || car?.bodyType || (suv ? 'SUV' : estate ? 'Estate' : hatchback ? 'Hatchback' : 'Saloon');
    const size = car?.size || (suv || estate ? 'Large' : hatchback ? 'Compact' : premium ? 'Executive' : 'Medium');
    const seats = Number(car?.seats ?? car?.seatCount ?? (vehicleType === 'Hatchback' ? 4 : 5));
    const fuelType = car?.fuelType || (electric ? 'Electric' : hybrid ? 'Hybrid' : 'Petrol');

    return {
      engineSize: car?.engineSize || (electric ? 'Dual motor' : hybrid ? '1.6L hybrid' : premium ? '2.0L' : '1.4L'),
      horsepower: Number(car?.horsepower ?? car?.hp ?? (electric ? 320 : hybrid ? 220 : premium ? 190 : 120)),
      estimatedRangeMiles: Number(car?.rangeMiles ?? car?.estimatedRangeMiles ?? (electric ? 330 : hybrid ? 430 : premium ? 470 : 390)),
      seats,
      luggageCapacityLitres: Number(car?.luggageCapacityLitres ?? car?.luggageCapacity ?? (suv ? 520 : estate ? 560 : hatchback ? 300 : 400)),
      bootCapacityLitres: Number(car?.bootCapacityLitres ?? car?.bootCapacity ?? (suv ? 520 : estate ? 560 : hatchback ? 300 : 400)),
      drivetrain: car?.drivetrain || (suv || electric ? 'All-wheel drive' : 'Front-wheel drive'),
      fuelEconomyMpg: Number(car?.fuelEconomyMpg ?? (electric ? 0 : hybrid ? 67 : premium ? 42 : 52)),
      fuelType,
      co2Band: car?.co2Band || (electric ? 'Zero emission' : hybrid ? 'Low emission' : premium ? 'Medium emission' : 'Standard'),
      size,
      vehicleType
    };
  }

  private deriveType(car: any): string {
    const text = this.normalise(`${car?.carName || ''} ${car?.description || ''}`);
    if (text.includes('suv') || text.includes('qashqai') || text.includes('kuga') || text.includes('x3') || text.includes('glc')) { return 'SUV'; }
    if (text.includes('estate') || text.includes('touring') || text.includes('avant')) { return 'Estate'; }
    if (text.includes('hatch') || text.includes('golf') || text.includes('picanto') || text.includes('focus')) { return 'Hatchback'; }
    return 'Saloon';
  }

  private normalise(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private unique<T>(values: T[]): T[] {
    return Array.from(new Set(values.filter((value) => {
      if (value === undefined || value === null) { return false; }
      if (typeof value === 'string') { return value.trim().length > 0; }
      return true;
    })));
  }
}
