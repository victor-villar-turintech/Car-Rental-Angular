import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { PickupLocationOption } from '../models/pickup-location';

@Injectable({ providedIn: 'root' })
export class PickupLocationService {
  private readonly locations: PickupLocationOption[] = [
    { id: 'central-london', label: 'Central London branch', type: 'Branch', surcharge: 0 },
    { id: 'lhr-t2', label: 'London Heathrow Airport - Terminal 2', type: 'Airport', airport: 'Heathrow', terminal: 'Terminal 2', surcharge: 45 },
    { id: 'lhr-t3', label: 'London Heathrow Airport - Terminal 3', type: 'Airport', airport: 'Heathrow', terminal: 'Terminal 3', surcharge: 45 },
    { id: 'lhr-t4', label: 'London Heathrow Airport - Terminal 4', type: 'Airport', airport: 'Heathrow', terminal: 'Terminal 4', surcharge: 45 },
    { id: 'lhr-t5', label: 'London Heathrow Airport - Terminal 5', type: 'Airport', airport: 'Heathrow', terminal: 'Terminal 5', surcharge: 45 },
    { id: 'lgw-north', label: 'London Gatwick Airport - North Terminal', type: 'Airport', airport: 'Gatwick', terminal: 'North Terminal', surcharge: 45 },
    { id: 'lgw-south', label: 'London Gatwick Airport - South Terminal', type: 'Airport', airport: 'Gatwick', terminal: 'South Terminal', surcharge: 45 },
    { id: 'stn-main', label: 'London Stansted Airport - Main Terminal', type: 'Airport', airport: 'Stansted', terminal: 'Main Terminal', surcharge: 50 },
    { id: 'ltn-main', label: 'London Luton Airport - Main Terminal', type: 'Airport', airport: 'Luton', terminal: 'Main Terminal', surcharge: 50 },
    { id: 'lcy-main', label: 'London City Airport - Main Terminal', type: 'Airport', airport: 'London City', terminal: 'Main Terminal', surcharge: 35 },
    { id: 'sen-main', label: 'London Southend Airport - Main Terminal', type: 'Airport', airport: 'Southend', terminal: 'Main Terminal', surcharge: 55 },
  ];

  getPickupLocations(): Observable<ListResponseModel<PickupLocationOption>> {
    return of({ success: true, message: 'Pickup locations loaded.', data: this.locations });
  }
}
