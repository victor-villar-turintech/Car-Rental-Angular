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
  featuredCar?: Car;
  dataLoaded = false;

  constructor(private carService: CarService) {}

  ngOnInit(): void {
    this.getCars();
  }

  getCars(): void {
    this.carService.getCars().subscribe((response) => {
      const catalogue = response.data || [];

      this.cars = catalogue.slice(0, 3);
      this.featuredCar = this.selectFeaturedCar(catalogue);
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

  getFeaturedCarSummary(car: Car): string {
    const descriptionSummary = car.description ? car.description.split('.')[0] : 'Rental vehicle';
    const transmission = this.toTitleCase(this.extractTransmission(car.description));

    return `${descriptionSummary} · ${transmission} · London pickup`;
  }

  private extractTransmission(description: string | undefined): string {
    if (!description) {
      return 'Automatic';
    }

    const match = description.match(/,\s*([^,]+)\s+transmission/i);
    return match ? match[1] : 'Automatic';
  }

  private toTitleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
