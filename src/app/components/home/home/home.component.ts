import { MOCK_CARS } from 'src/app/data/mock-rental-data';

import { Component, OnInit } from '@angular/core';

import { Car } from 'src/app/models/car';
import { CarService } from 'src/app/services/car.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private readonly featuredCarStorageKey = 'rentacar-featured-car-id';

  vehicleCount = MOCK_CARS.length;
  brandCount = new Set(MOCK_CARS.map((car) => car.brandId)).size;
  minDailyPrice = Math.min(...MOCK_CARS.map((car) => car.dailyPrice));

  cars: Car[] = [];
  popularCars: Car[] = [];
  featuredCar?: Car;
  dataLoaded = false;

  constructor(private carService: CarService) {}

  ngOnInit(): void {
    this.getCars();
  }

  getCars(): void {
    this.carService.getCars().subscribe((response) => {
      const catalogue = response.data || [];

      this.cars = catalogue;
      this.featuredCar = this.selectFeaturedCar(catalogue);
      this.popularCars = this.selectPopularCars(catalogue, this.featuredCar?.carId);
      this.dataLoaded = true;
    });
  }

  private selectFeaturedCar(catalogue: Car[]): Car | undefined {
    if (!catalogue.length) {
      return undefined;
    }

    const previousFeaturedCarId = Number(localStorage.getItem(this.featuredCarStorageKey));
    const selectableCars = catalogue.length > 1
      ? catalogue.filter((car) => car.carId !== previousFeaturedCarId)
      : catalogue;

    const selectedCar = selectableCars[Math.floor(Math.random() * selectableCars.length)];
    localStorage.setItem(this.featuredCarStorageKey, selectedCar.carId.toString());

    return selectedCar;
  }

  private selectPopularCars(catalogue: Car[], featuredCarId?: number): Car[] {
    return [...catalogue]
      .filter((car) => car.carId !== featuredCarId)
      .sort((a, b) => {
        const aScore = this.vehicleScore(a);
        const bScore = this.vehicleScore(b);

        if (bScore !== aScore) {
          return bScore - aScore;
        }

        return a.dailyPrice - b.dailyPrice;
      })
      .slice(0, 4);
  }

  getFeaturedCarSummary(car: Car): string {
    return `${this.getShortDescription(car)} · ${this.getTransmission(car)} · London pickup`;
  }

  getShortDescription(car: Car): string {
    return car.description ? car.description.split('.')[0] : 'Rental vehicle';
  }

  getTransmission(car: Car): string {
    const description = car.description || '';
    const match = description.match(/,\s*([^,]+)\s+transmission/i);
    return match ? this.toTitleCase(match[1]) : 'Automatic';
  }

  getCategory(car: Car): string {
    const description = car.description || '';
    const match = description.match(/^([^,.]+)/);
    return match ? this.toTitleCase(match[1].trim()) : 'Vehicle';
  }

  getPickupLabel(car: Car): string {
    const description = (car.description || '').toLowerCase();
    return description.includes('airport') ? 'Airport pickup' : 'London pickup';
  }

  getImagePath(car: Car): string {
    return car.imagePath || 'assets/images/cars/car-placeholder.svg';
  }

  private vehicleScore(car: Car): number {
    const text = `${car.brandName || ''} ${car.carName || ''} ${car.description || ''}`.toLowerCase();
    let score = 0;

    if (text.includes('electric') || text.includes('hybrid') || text.includes('recharge')) {
      score += 5;
    }

    if (text.includes('estate') || text.includes('suv') || text.includes('family')) {
      score += 4;
    }

    if (text.includes('premium') || text.includes('performance') || text.includes('luxury')) {
      score += 3;
    }

    if (car.dailyPrice <= this.minDailyPrice + 15) {
      score += 2;
    }

    return score;
  }

  private toTitleCase(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }
}
