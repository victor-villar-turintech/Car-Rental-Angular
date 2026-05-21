export interface CatalogueAvailabilitySummary {
  catalogueItemId: number;
  availableCount: number;
  totalFleetCount: number;
  isAvailable: boolean;
  statusLabel: string;
}

export interface CatalogueVehicleViewModel {
  id: number;
  catalogueItemId: number;

  make: string;
  brand: string;
  model: string;
  trim?: string;
  year?: number;
  displayName: string;

  bodyType: string;
  category?: string;
  transmission: string;
  fuelType: string;
  drivetrain?: string;

  seats: number;
  doors?: number;
  luggageCapacity?: number;
  bootCapacityLitres?: number;
  engineSize?: string;
  horsepower?: number;
  estimatedRangeMiles?: number;
  fuelEconomy?: string;
  emissionsBand?: string;
  co2Emissions?: string;

  baseDailyPrice: number;
  dailyPrice: number;
  pricePerDay: number;

  imageUrl: string;
  image: string;
  description: string;

  colour?: string;
  color?: string;

  features: string[];
  badges: string[];

  availability: CatalogueAvailabilitySummary;
  isAvailable: boolean;
}
