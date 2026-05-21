import { RentalLocation } from '../models/rental-location.model';

export const MOCK_RENTAL_LOCATIONS: RentalLocation[] = [
  {
    id: 1,
    name: 'Central London Branch',
    type: 'branch',
    address: '100 Victoria Street',
    city: 'London',
    postcode: 'SW1E 5JL',
    isActive: true
  },
  {
    id: 2,
    name: 'Heathrow Airport Terminal 5',
    type: 'airport',
    address: 'Heathrow Airport Terminal 5',
    city: 'London',
    postcode: 'TW6 2GA',
    isActive: true
  },
  {
    id: 3,
    name: 'Gatwick Airport South Terminal',
    type: 'airport',
    address: 'Gatwick Airport South Terminal',
    city: 'London',
    postcode: 'RH6 0NP',
    isActive: true
  }
];
