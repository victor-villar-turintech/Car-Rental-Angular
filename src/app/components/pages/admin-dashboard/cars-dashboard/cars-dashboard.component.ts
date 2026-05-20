import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Car } from 'src/app/models/car';
import { DashboardCars } from 'src/app/models/dashboard-cars';
import { CarService } from 'src/app/services/car.service';

@Component({
  selector: 'app-cars-dashboard',
  templateUrl: './cars-dashboard.component.html',
  styleUrls: ['./cars-dashboard.component.css']
})
export class CarsDashboardComponent implements OnInit {
  cars: DashboardCars[] = [];
  dataLoaded = false;

  constructor(
    private carService: CarService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.getCars();
  }

  getCars(): void {
    this.dataLoaded = false;

    this.carService.getAllCarDetail().subscribe((response) => {
      this.cars = response.data || [];
      this.dataLoaded = true;
    });
  }

  deleteCar(car: DashboardCars): void {
    if (!window.confirm(`Delete ${car.brandName} ${car.carName}?`)) {
      return;
    }

    this.carService.deleteCar(car as unknown as Car).subscribe((response) => {
      this.toastrService.success(response.message || 'Car deleted.');
      this.getCars();
    });
  }
}
