export interface VehicleCatalogueItem {
  id: number;
  make: string;
  model: string;
  trim?: string;
  year?: number;

  bodyType: string;
  category?: string;

  transmission: string;
  fuelType: string;
  drivetrain?: string;

  engineSize?: string;
  horsepower?: number;
  estimatedRangeMiles?: number;

  seats: number;
  doors?: number;
  luggageCapacity?: number;
  bootCapacityLitres?: number;

  fuelEconomy?: string;
  emissionsBand?: string;
  co2Emissions?: string;

  baseDailyPrice: number;
  imageUrl: string;
  description: string;

  features?: string[];
  badges?: string[];

  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleCatalogueFormModel extends VehicleCatalogueItem {}
