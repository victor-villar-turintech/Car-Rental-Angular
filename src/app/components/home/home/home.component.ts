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
  
  vehicleCount = MOCK_CARS.length;
  brandCount = new Set(MOCK_CARS.map((car) => car.brandId)).size;
  minDailyPrice = Math.min(...MOCK_CARS.map((car) => car.dailyPrice));

cars: Car[] = [];
  dataLoaded = false;

  constructor(private carService: CarService) {}

  ngOnInit(): void {
    this.getCars();
  }

  getCars(): void {
    this.carService.getCars().subscribe((response) => {
      this.cars = response.data.slice(0, 3);
      this.dataLoaded = true;
    });
  }
}
