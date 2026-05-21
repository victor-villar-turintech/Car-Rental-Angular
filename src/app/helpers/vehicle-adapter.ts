import { VehicleCatalogueItem } from '../models/vehicle-catalogue-item.model';
import { FleetVehicle } from '../models/fleet-vehicle.model';
import {
  CatalogueAvailabilitySummary,
  CatalogueVehicleViewModel
} from '../models/catalogue-availability-summary.model';

export function getAvailabilitySummary(
  catalogueItem: VehicleCatalogueItem,
  fleetVehicles: FleetVehicle[]
): CatalogueAvailabilitySummary {
  const matchingFleet = fleetVehicles.filter(
    vehicle => vehicle.catalogueItemId === catalogueItem.id && vehicle.status !== 'retired'
  );

  const availableFleet = matchingFleet.filter(vehicle => vehicle.status === 'available');

  let statusLabel = 'Unavailable';

  if (availableFleet.length > 2) {
    statusLabel = 'Available';
  } else if (availableFleet.length === 2) {
    statusLabel = '2 available';
  } else if (availableFleet.length === 1) {
    statusLabel = 'Only 1 left';
  }

  return {
    catalogueItemId: catalogueItem.id,
    availableCount: availableFleet.length,
    totalFleetCount: matchingFleet.length,
    isAvailable: availableFleet.length > 0,
    statusLabel
  };
}

export function toCatalogueVehicleViewModel(
  catalogueItem: VehicleCatalogueItem,
  fleetVehicles: FleetVehicle[]
): CatalogueVehicleViewModel {
  const availability = getAvailabilitySummary(catalogueItem, fleetVehicles);
  const displayName = [
    catalogueItem.make,
    catalogueItem.model,
    catalogueItem.trim
  ].filter(Boolean).join(' ');

  const firstFleetVehicle = fleetVehicles.find(
    vehicle => vehicle.catalogueItemId === catalogueItem.id && vehicle.status !== 'retired'
  );

  return {
    id: catalogueItem.id,
    catalogueItemId: catalogueItem.id,
    make: catalogueItem.make,
    brand: catalogueItem.make,
    model: catalogueItem.model,
    trim: catalogueItem.trim,
    year: catalogueItem.year,
    displayName,
    bodyType: catalogueItem.bodyType,
    category: catalogueItem.category,
    transmission: catalogueItem.transmission,
    fuelType: catalogueItem.fuelType,
    drivetrain: catalogueItem.drivetrain,
    seats: catalogueItem.seats,
    doors: catalogueItem.doors,
    luggageCapacity: catalogueItem.luggageCapacity,
    bootCapacityLitres: catalogueItem.bootCapacityLitres,
    engineSize: catalogueItem.engineSize,
    horsepower: catalogueItem.horsepower,
    estimatedRangeMiles: catalogueItem.estimatedRangeMiles,
    fuelEconomy: catalogueItem.fuelEconomy,
    emissionsBand: catalogueItem.emissionsBand,
    co2Emissions: catalogueItem.co2Emissions,
    baseDailyPrice: catalogueItem.baseDailyPrice,
    dailyPrice: catalogueItem.baseDailyPrice,
    pricePerDay: catalogueItem.baseDailyPrice,
    imageUrl: catalogueItem.imageUrl,
    image: catalogueItem.imageUrl,
    description: catalogueItem.description,
    colour: firstFleetVehicle ? firstFleetVehicle.colour : undefined,
    color: firstFleetVehicle ? firstFleetVehicle.colour : undefined,
    features: catalogueItem.features || [],
    badges: catalogueItem.badges || [],
    availability,
    isAvailable: availability.isAvailable
  };
}
