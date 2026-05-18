import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Car } from '../models/car';
import { ResponseModel } from '../models/responseModel';
import { SingleResponseModel } from '../models/singleResponseModel';
import { DashboardCars } from '../models/dashboard-cars';
import { CarStandart } from '../models/carStandart';
import { MOCK_CARS } from '../data/mock-rental-data';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private cars: Car[] = [...MOCK_CARS];

  getCars(): Observable<ListResponseModel<Car>> {
    return this.list(this.cars);
  }

  getCarById(carId: number): Observable<SingleResponseModel<Car>> {
    const car = this.cars.find((item) => item.carId === Number(carId));
    return of({ success: !!car, message: car ? 'Car found.' : 'Car not found.', data: car });
  }

  addCar(car: Car): Observable<ResponseModel> {
    const nextId = Math.max(...this.cars.map((item) => item.carId), 0) + 1;
    this.cars = [...this.cars, { ...car, carId: car.carId || nextId }];
    return this.ok('Car added.');
  }

  updateCar(car: CarStandart): Observable<ResponseModel> {
    this.cars = this.cars.map((item) => item.carId === car.carId ? { ...item, ...car } as Car : item);
    return this.ok('Car updated.');
  }

  deleteCar(car: CarStandart): Observable<ResponseModel> {
    this.cars = this.cars.filter((item) => item.carId !== car.carId);
    return this.ok('Car deleted.');
  }

  deletCar(car: CarStandart): Observable<ResponseModel> {
    return this.deleteCar(car);
  }

  getCarsByBrand(brandId: number): Observable<ListResponseModel<Car>> {
    return this.list(this.cars.filter((car) => car.brandId === Number(brandId)));
  }

  getCarsByColor(colorId: number): Observable<ListResponseModel<Car>> {
    return this.list(this.cars.filter((car) => car.colorId === Number(colorId)));
  }

  getCarsBySelect(brandId: number, colorId: number): Observable<ListResponseModel<Car>> {
    return this.list(this.cars.filter((car) => car.brandId === Number(brandId) && car.colorId === Number(colorId)));
  }

  getCarDetail(carId: number): Observable<ListResponseModel<Car>> {
    return this.list(this.cars.filter((car) => car.carId === Number(carId)));
  }

  getAllCarDetail(): Observable<ListResponseModel<DashboardCars>> {
    return of({ success: true, message: 'Dashboard cars loaded.', data: this.cars as unknown as DashboardCars[] });
  }

  private list<T>(data: T[]): Observable<ListResponseModel<T>> {
    return of({ success: true, message: 'Data loaded.', data });
  }

  private ok(message: string): Observable<ResponseModel> {
    return of({ success: true, message });
  }
}
