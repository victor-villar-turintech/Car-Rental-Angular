import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarService } from '../../../services/car.service';
import { FavouriteVehicleService } from '../../../services/favourite-vehicle.service';

@Component({
  selector: 'app-customer-favourites',
  templateUrl: './customer-favourites.component.html',
  styleUrls: ['./customer-favourites.component.css']
})
export class CustomerFavouritesComponent implements OnInit {
  cars: any[] = [];
  favouriteCars: any[] = [];
  recentlyViewedCars: any[] = [];
  loading = true;

  constructor(
    private carService: CarService,
    private favouriteVehicleService: FavouriteVehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  openDetails(car: any): void {
    const id = this.carId(car);
    this.favouriteVehicleService.addRecentlyViewed(id);
    this.router.navigate(['/cars', id]);
  }

  bookNow(car: any): void {
    const id = this.carId(car);
    this.favouriteVehicleService.addRecentlyViewed(id);
    this.router.navigate(['/car/rental', id]);
  }

  removeFavourite(car: any): void {
    this.favouriteVehicleService.removeFavourite(this.carId(car));
    this.refreshLists();
  }

  clearRecentlyViewed(): void {
    this.favouriteVehicleService.clearRecentlyViewed();
    this.refreshLists();
  }

  private loadCars(): void {
    this.loading = true;
    const result = this.carService.getCars() as any;

    if (result && typeof result.subscribe === 'function') {
      result.subscribe((response: any) => {
        this.cars = this.extractCars(response);
        this.refreshLists();
        this.loading = false;
      }, () => {
        this.cars = [];
        this.refreshLists();
        this.loading = false;
      });
      return;
    }

    this.cars = this.extractCars(result);
    this.refreshLists();
    this.loading = false;
  }

  private refreshLists(): void {
    const favouriteIds = this.favouriteVehicleService.getFavouriteIds();
    const recentlyViewedIds = this.favouriteVehicleService.getRecentlyViewedIds();

    this.favouriteCars = favouriteIds
      .map((id) => this.cars.find((car) => this.carId(car) === id))
      .filter(Boolean);

    this.recentlyViewedCars = recentlyViewedIds
      .map((id) => this.cars.find((car) => this.carId(car) === id))
      .filter(Boolean);
  }

  private extractCars(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.cars)) {
      return response.cars;
    }

    return [];
  }

  carId(car: any): number {
    return Number(car?.carId || car?.id || 0);
  }

  vehicleName(car: any): string {
    return [car?.brandName, car?.carName || car?.modelName || car?.model].filter(Boolean).join(' ');
  }

  imagePath(car: any): string {
    return car?.imagePath || car?.imageUrl || 'assets/img/car-placeholder.png';
  }
}
