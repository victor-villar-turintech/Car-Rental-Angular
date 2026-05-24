import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Car } from 'src/app/models/car';
import { DashboardCars } from 'src/app/models/dashboard-cars';
import { CarService } from 'src/app/services/car.service';
import { CsvColumn, downloadCsv, timestampedFilename } from '../../../../helpers/csv-export';
import { ConfirmDialogService } from 'src/app/services/confirm-dialog.service';

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
    private toastrService: ToastrService,
    private confirmDialogService: ConfirmDialogService,
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

  async deleteCar(car: DashboardCars): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: `Delete ${car.brandName} ${car.carName}?`,
      message: 'This removes the vehicle from the local catalogue. Restore by resetting demo cars in admin settings.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) { return; }

    this.carService.deleteCar(car as unknown as Car).subscribe((response) => {
      this.toastrService.success(response.message || 'Car deleted.');
      this.getCars();
    });
  }

  exportCatalogueCsv(): void {
    const columns: CsvColumn<DashboardCars>[] = [
      { header: 'Catalogue ID', value: (car) => car.carId },
      { header: 'Brand', value: (car) => this.displayBrand(car) },
      { header: 'Model', value: (car) => car.carName || '' },
      { header: 'Colour', value: (car) => car.colorName || '' },
      { header: 'Model year', value: (car) => car.modelYear || '' },
      { header: 'Daily price (GBP)', value: (car) => car.dailyPrice || 0 },
      { header: 'Number plate', value: (car) => car.numberPlate || '' },
      { header: 'Description', value: (car) => car.description || '' },
      { header: 'Image path', value: (car) => car.imagePath || '' }
    ];
    downloadCsv(timestampedFilename('admin-catalogue'), this.cars, columns);
  }

  displayBrand(car: any): string {
    return car.brandName || car.brand || car.brandNameOfCar || 'Unknown brand';
  }

  displayModel(car: any): string {
    return car.carName || car.model || car.modelName || car.name || 'Unknown model';
  }

  displayColour(car: any): string {
    return car.colorName || car.colourName || car.colour || car.color || 'N/A';
  }

  averageDailyPrice(): number {
    if (!this.cars || this.cars.length === 0) {
      return 0;
    }

    const total = this.cars.reduce((sum: number, car: any) => sum + Number(car.dailyPrice || car.price || 0), 0);
    return Math.round(total / this.cars.length);
  }

  countByTransmission(transmission: string): number {
    return (this.cars || []).filter((car: any) => this.specFor(car).transmission.toLowerCase() === transmission.toLowerCase()).length;
  }

  countByFuelGroup(): number {
    return (this.cars || []).filter((car: any) => {
      const fuel = this.specFor(car).fuelType.toLowerCase();
      return fuel.includes('electric') || fuel.includes('hybrid');
    }).length;
  }

  specFor(car: any): any {
    const name = `${this.displayBrand(car)} ${this.displayModel(car)}`.toLowerCase();
    const description = String(car.description || '').toLowerCase();
    const category = String(car.categoryName || car.category || car.vehicleType || '').toLowerCase();
    const text = `${name} ${description} ${category}`;

    const isElectric = text.includes('tesla') || text.includes('electric') || text.includes('id.4') || text.includes('model 3') || text.includes('model y') || text.includes('model s');
    const isHybrid = text.includes('hybrid') || text.includes('recharge') || text.includes('plug-in');
    const isSuv = text.includes('suv') || text.includes('kuga') || text.includes('qashqai') || text.includes('x3') || text.includes('q5') || text.includes('glc') || text.includes('tiguan') || text.includes('velar') || text.includes('sport hse');
    const isEstate = text.includes('estate') || text.includes('touring') || text.includes('avant');
    const isPerformance = text.includes('amg') || text.includes('m sport') || text.includes('gti') || text.includes('performance');
    const isCompact = text.includes('picanto') || text.includes('208') || text.includes('clio') || text.includes('focus') || text.includes('jazz') || text.includes('a3') || text.includes('golf');

    const dailyPrice = Number(car.dailyPrice || car.price || 0);
    const seats = Number(car.seats || car.seatCount || (isCompact ? 4 : 5));
    const fuelType = car.fuelType || car.fuel || (isElectric ? 'Electric' : isHybrid ? 'Hybrid' : 'Petrol');
    const transmission = car.transmission || car.transmissionName || (text.includes('manual') ? 'Manual' : 'Automatic');
    const vehicleType = car.vehicleType || car.bodyType || car.categoryName || car.category || (isSuv ? 'SUV' : isEstate ? 'Estate' : isCompact ? 'Hatchback' : 'Saloon');

    return {
      vehicleType,
      transmission,
      fuelType,
      engineSize: car.engineSize || car.engineSizeLitres || (isElectric ? 'Dual motor' : isHybrid ? '1.6L hybrid' : isPerformance ? '2.0L turbo' : isSuv ? '2.0L' : '1.5L'),
      horsepower: car.horsepower || car.hp || (isElectric ? 350 : isHybrid ? 220 : isPerformance ? 260 : dailyPrice > 120 ? 240 : isSuv ? 190 : 130),
      estimatedRangeMiles: car.estimatedRangeMiles || car.rangeMiles || car.range || (isElectric ? 330 : isHybrid ? 430 : isSuv || isEstate ? 470 : 410),
      seats,
      luggageCapacityLitres: car.luggageCapacityLitres || car.luggageCapacity || (isEstate ? 560 : isSuv ? 520 : isCompact ? 300 : 430),
      bootCapacityLitres: car.bootCapacityLitres || car.bootCapacity || (isEstate ? 560 : isSuv ? 520 : isCompact ? 300 : 430),
      drivetrain: car.drivetrain || (isElectric || isSuv || dailyPrice > 130 ? 'All-wheel drive' : 'Front-wheel drive'),
      fuelEconomyMpg: car.fuelEconomyMpg || car.economyMpg || (isElectric ? 0 : isHybrid ? 67 : isSuv ? 42 : 50),
      emissionsBand: car.emissionsBand || car.co2Band || (isElectric ? 'Zero emission' : isHybrid ? 'Low emission' : dailyPrice > 120 ? 'Medium' : 'Standard')
    };
  }

}
