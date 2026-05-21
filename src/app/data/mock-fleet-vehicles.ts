import { FleetVehicle } from '../models/fleet-vehicle.model';

export const MOCK_FLEET_VEHICLES: FleetVehicle[] = [
  { id: 1, catalogueItemId: 1, registrationNumber: 'LD22 BMW', colour: 'Black', mileage: 18400, status: 'available', currentLocationId: 1, lastServiceDate: '2026-03-12', nextServiceDueDate: '2026-09-12' },
  { id: 2, catalogueItemId: 1, registrationNumber: 'LD22 BMV', colour: 'White', mileage: 22100, status: 'maintenance', currentLocationId: 2, lastServiceDate: '2026-04-02', nextServiceDueDate: '2026-10-02' },
  { id: 3, catalogueItemId: 2, registrationNumber: 'LD21 AUD', colour: 'Grey', mileage: 26750, status: 'available', currentLocationId: 1, lastServiceDate: '2026-01-20', nextServiceDueDate: '2026-07-20' },
  { id: 4, catalogueItemId: 2, registrationNumber: 'LD21 AUE', colour: 'Blue', mileage: 30100, status: 'available', currentLocationId: 3, lastServiceDate: '2026-02-15', nextServiceDueDate: '2026-08-15' },
  { id: 5, catalogueItemId: 3, registrationNumber: 'LD22 MER', colour: 'Silver', mileage: 19450, status: 'available', currentLocationId: 2, lastServiceDate: '2026-03-01', nextServiceDueDate: '2026-09-01' },
  { id: 6, catalogueItemId: 4, registrationNumber: 'LD21 GLF', colour: 'Red', mileage: 33500, status: 'available', currentLocationId: 1, lastServiceDate: '2026-02-10', nextServiceDueDate: '2026-08-10' },
  { id: 7, catalogueItemId: 4, registrationNumber: 'LD21 GLG', colour: 'White', mileage: 28700, status: 'booked', currentLocationId: 1, lastServiceDate: '2026-03-10', nextServiceDueDate: '2026-09-10' },
  { id: 8, catalogueItemId: 5, registrationNumber: 'LD22 SUV', colour: 'Black', mileage: 22600, status: 'available', currentLocationId: 3, lastServiceDate: '2026-04-01', nextServiceDueDate: '2026-10-01' },
  { id: 9, catalogueItemId: 6, registrationNumber: 'LD23 EVS', colour: 'White', mileage: 12200, status: 'available', currentLocationId: 2, lastServiceDate: '2026-04-18', nextServiceDueDate: '2026-10-18' }
];
