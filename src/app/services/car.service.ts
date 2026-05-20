import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Car } from '../models/car';
import { ResponseModel } from '../models/responseModel';
import { SingleResponseModel } from '../models/singleResponseModel';
import { DashboardCars } from '../models/dashboard-cars';
import { CarStandart } from '../models/carStandart';
import { MOCK_BRANDS, MOCK_CARS, MOCK_COLORS } from '../data/mock-rental-data';

@Injectable({ providedIn: 'root' })
export class CarService {
  private cars: Car[] = MOCK_CARS.map((car) => this.normaliseCar(car as Car));

  getCars(): Observable<ListResponseModel<Car>> {
    return this.list(this.cars);
  }

  getCarById(carId: number): Observable<SingleResponseModel<Car>> {
    const car = this.cars.find((item) => item.carId === Number(carId));
    return of({ success: !!car, message: car ? 'Car found.' : 'Car not found.', data: car });
  }

  addCar(car: CarStandart): Observable<ResponseModel> {
    const nextId = Math.max(...this.cars.map((item) => item.carId), 0) + 1;
    const carId = car.carId || nextId;
    this.cars = [...this.cars, this.normaliseCar({ ...car, carId } as Car)];
    return this.ok('Car added.');
  }

  updateCar(car: CarStandart): Observable<ResponseModel> {
    const carId = Number(car.carId);
    this.cars = this.cars.map((item) => item.carId === carId ? this.normaliseCar({ ...item, ...car, carId } as Car) : item);
    return this.ok('Car updated.');
  }

  deleteCar(car: CarStandart): Observable<ResponseModel> {
    const carId = Number(car.carId);
    this.cars = this.cars.filter((item) => item.carId !== carId);
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

  private normaliseCar(car: Car): Car {
    const brandId = Number(car.brandId);
    const colorId = Number(car.colorId);
    const brandName = car.brandName || MOCK_BRANDS.find((brand) => brand.brandId === brandId)?.brandName || 'Unknown brand';
    const colorName = car.colorName || MOCK_COLORS.find((color) => color.colorId === colorId)?.colorName || 'Unknown colour';
    const imagePath = car.imagePath || `assets/cars/car-${('000' + car.carId).slice(-3)}.png`;

    return {
      ...car,
      carId: Number(car.carId),
      brandId,
      colorId,
      brandName,
      colorName,
      modelYear: Number(car.modelYear),
      dailyPrice: Number(car.dailyPrice),
      imagePath,
      numberPlate: this.normaliseNumberPlate(car.numberPlate, car.carId, brandName, car.carName, car.modelYear)
    };
  }

  private normaliseNumberPlate(numberPlate: string | undefined, carId: number, brandName: string, carName: string, modelYear: number): string {
    if (numberPlate && numberPlate.trim()) {
      return numberPlate.trim().toUpperCase();
    }

    const brandCode = this.alphaCode(brandName, 2);
    const modelCode = this.alphaCode(carName, 3);
    const yearCode = String(modelYear || new Date().getFullYear()).slice(-2);
    const serial = String(Number(carId || 0) * 37 + 11).slice(-3).padStart(3, '0');

    return `${brandCode}${yearCode} ${modelCode}${serial}`.toUpperCase();
  }

  private alphaCode(value: string, length: number): string {
    const cleaned = (value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    return (cleaned || 'CAR').padEnd(length, 'X').slice(0, length);
  }

  private list<T>(data: T[]): Observable<ListResponseModel<T>> {
    return of({ success: true, message: 'Data loaded.', data });
  }

  private ok(message: string): Observable<ResponseModel> {
    return of({ success: true, message });
  }
}
