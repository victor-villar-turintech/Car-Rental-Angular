export type FleetVehicleStatus =
  | 'available'
  | 'booked'
  | 'maintenance'
  | 'inactive'
  | 'retired';

export interface FleetVehicle {
  id: number;
  catalogueItemId: number;

  registrationNumber: string;
  colour: string;
  mileage: number;

  status: FleetVehicleStatus;
  currentLocationId?: number;

  lastServiceDate?: string;
  nextServiceDueDate?: string;

  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}
