import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Rental } from '../models/rental';
import { ResponseModel } from '../models/responseModel';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private rentals: Rental[] = [];

  getRental(): Observable<ListResponseModel<Rental>> {
    return of({ success: true, message: 'Rentals loaded.', data: this.rentals });
  }

  addRental(rental: Rental): Observable<ResponseModel> {
    const nextId = Math.max(...this.rentals.map((item) => item.rentalId || 0), 0) + 1;
    this.rentals = [...this.rentals, { ...rental, rentalId: nextId }];
    return of({ success: true, message: 'Rental saved.' });
  }

  isRentable(rental: Rental): Observable<ResponseModel> {
    return of({ success: true, message: 'Car is available for the selected dates.' });
  }
}
