import * as LegacyRentalData from '../data/mock-rental-data';

import { FleetVehicle } from '../models/fleet-vehicle.model';
import { VehicleCatalogueItem } from '../models/vehicle-catalogue-item.model';

type AnyRecord = { [key: string]: any };

function normalise(value: any): string {
  return String(value || '').trim().toLowerCase();
}

function firstDefined<T>(...values: Array<T | undefined | null | ''>): T | undefined {
  return values.find(value => value !== undefined && value !== null && value !== '') as T | undefined;
}

function toNumber(value: any, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function optionalNumber(value: any): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function flattenCandidateArrays(value: any, arrays: AnyRecord[][] = []): AnyRecord[][] {
  if (!value) {
    return arrays;
  }

  if (Array.isArray(value)) {
    if (value.some(item => item && typeof item === 'object')) {
      arrays.push(value as AnyRecord[]);
    }

    value.forEach(item => flattenCandidateArrays(item, arrays));
    return arrays;
  }

  if (typeof value === 'object') {
    Object.keys(value).forEach(key => flattenCandidateArrays(value[key], arrays));
  }

  return arrays;
}

function moduleExportArrays(): AnyRecord[][] {
  return flattenCandidateArrays(LegacyRentalData as AnyRecord);
}

function keysOf(item: AnyRecord): string[] {
  return Object.keys(item || {}).map(normalise);
}

function hasAnyKey(item: AnyRecord, keys: string[]): boolean {
  const itemKeys = keysOf(item);
  return keys.some(key => itemKeys.includes(normalise(key)));
}

function looksLikeCar(item: AnyRecord): boolean {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const hasVehicleIdentity = hasAnyKey(item, [
    'id',
    'carId',
    'CarId',
    'make',
    'brand',
    'brandId',
    'BrandId',
    'brandName',
    'BrandName',
    'carName',
    'CarName',
    'model',
    'modelName',
    'ModelName',
    'imagePath',
    'imageUrl'
  ]);

  const hasVehicleCommercialData = hasAnyKey(item, [
    'dailyPrice',
    'baseDailyPrice',
    'price',
    'pricePerDay',
    'modelYear',
    'year',
    'imagePath',
    'imageUrl',
    'fuelType',
    'transmission',
    'seats',
    'colorId',
    'ColorId',
    'colourId',
    'ColourId',
    'colorName',
    'ColorName'
  ]);

  return hasVehicleIdentity && hasVehicleCommercialData;
}

function looksLikeBrand(item: AnyRecord): boolean {
  return hasAnyKey(item, ['brandName', 'BrandName']) ||
    (hasAnyKey(item, ['name']) && !looksLikeCar(item));
}

function looksLikeColour(item: AnyRecord): boolean {
  return hasAnyKey(item, ['colorName', 'ColorName', 'colourName', 'ColourName']);
}

function allCandidateArrays(): AnyRecord[][] {
  return moduleExportArrays();
}

function findLegacyCars(): AnyRecord[] {
  const candidates = allCandidateArrays()
    .map(array => ({
      array,
      score: array.filter(item => looksLikeCar(item)).length
    }))
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score || b.array.length - a.array.length);

  return candidates[0]?.array.filter(item => looksLikeCar(item)) || [];
}

function findLegacyBrands(): AnyRecord[] {
  const candidates = allCandidateArrays()
    .map(array => ({
      array,
      score: array.filter(item => item && typeof item === 'object' && looksLikeBrand(item)).length
    }))
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.array || [];
}

function findLegacyColours(): AnyRecord[] {
  const candidates = allCandidateArrays()
    .map(array => ({
      array,
      score: array.filter(item => item && typeof item === 'object' && looksLikeColour(item)).length
    }))
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.array || [];
}

function lookupName(items: AnyRecord[], id: any, idKeys: string[], nameKeys: string[]): string | undefined {
  if (id === undefined || id === null) {
    return undefined;
  }

  const match = items.find(item => idKeys.some(key => String(item[key]) === String(id)));

  if (!match) {
    return undefined;
  }

  return firstDefined(...nameKeys.map(key => match[key]));
}

function getMake(car: AnyRecord, brands: AnyRecord[]): string {
  return firstDefined(
    car.make,
    car.brand,
    car.brandName,
    car.BrandName,
    lookupName(
      brands,
      firstDefined(car.brandId, car.BrandId, car.brandID),
      ['id', 'brandId', 'BrandId', 'brandID'],
      ['name', 'brandName', 'BrandName']
    )
  ) || 'Unknown Make';
}

function getModel(car: AnyRecord): string {
  const directModel = firstDefined(
    car.model,
    car.modelName,
    car.ModelName,
    car.vehicleModel,
    car.VehicleModel
  );

  if (directModel && String(directModel).trim().toLowerCase() !== 'vehicle') {
    return String(directModel).trim();
  }

  const carName = firstDefined(
    car.carName,
    car.CarName,
    car.name,
    car.title,
    car.displayName,
    car.vehicleName,
    car.VehicleName
  );

  if (carName) {
    return String(carName).trim();
  }

  return 'Vehicle';
}

function getColour(car: AnyRecord, colours: AnyRecord[]): string {
  return firstDefined(
    car.colour,
    car.color,
    car.colorName,
    car.colourName,
    car.ColorName,
    lookupName(
      colours,
      firstDefined(car.colorId, car.ColorId, car.colourId, car.ColourId),
      ['id', 'colorId', 'ColorId', 'colourId', 'ColourId'],
      ['name', 'colorName', 'ColorName', 'colourName', 'ColourName']
    )
  ) || 'Unspecified';
}

function getImageUrl(car: AnyRecord, id: number): string {
  return firstDefined(
    car.imageUrl,
    car.imageURL,
    car.imagePath,
    car.image,
    car.photoUrl,
    car.picture,
    `assets/cars/car-${String(id).padStart(3, '0')}.png`
  ) as string;
}

function getBaseDailyPrice(car: AnyRecord): number {
  return toNumber(firstDefined(car.baseDailyPrice, car.dailyPrice, car.price, car.rentalPrice, car.pricePerDay), 50);
}

function getBodyType(car: AnyRecord): string {
  return firstDefined(car.bodyType, car.vehicleType, car.type, car.category) || 'Car';
}

function getFuelType(car: AnyRecord): string {
  return firstDefined(car.fuelType, car.fuel, car.engineType) || 'Petrol';
}

function getTransmission(car: AnyRecord): string {
  return firstDefined(car.transmission, car.gearbox, car.transmissionType) || 'Automatic';
}

function getRegistration(car: AnyRecord, id: number): string {
  return firstDefined(
    car.registrationNumber,
    car.numberPlate,
    car.plate,
    car.reg,
    `CR${String(id).padStart(3, '0')} CAT`
  ) as string;
}

function getDescription(car: AnyRecord, make: string, model: string): string {
  return firstDefined(car.description, car.details, car.summary, `${make} ${model} available for rental.`) as string;
}

function uniqueCatalogueItems(items: VehicleCatalogueItem[]): VehicleCatalogueItem[] {
  const seen = new Set<string>();
  const result: VehicleCatalogueItem[] = [];

  for (const item of items) {
    const key = `${normalise(item.make)}|${normalise(item.model)}|${normalise(item.trim)}|${item.year || ''}|${item.imageUrl || ''}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push({
      ...item,
      id: result.length + 1
    });
  }

  return result;
}

export function buildVehicleCatalogueFromLegacyData(): VehicleCatalogueItem[] {
  const cars = findLegacyCars();
  const brands = findLegacyBrands();

  const mapped = cars.map((car, index) => {
    const originalId = toNumber(firstDefined(car.id, car.carId, car.CarId), index + 1);
    const make = getMake(car, brands);
    const model = getModel(car);
    const seats = toNumber(firstDefined(car.seats, car.seatCount), 5);
    const bodyType = getBodyType(car);
    const fuelType = getFuelType(car);
    const transmission = getTransmission(car);

    return {
      id: originalId,
      make,
      model,
      trim: firstDefined(car.trim, car.variant, car.version),
      year: optionalNumber(firstDefined(car.year, car.modelYear)),
      bodyType,
      category: firstDefined(car.category, car.segment, car.vehicleClass),
      transmission,
      fuelType,
      drivetrain: firstDefined(car.drivetrain, car.driveTrain),
      engineSize: firstDefined(car.engineSize, car.engine),
      horsepower: optionalNumber(firstDefined(car.horsepower, car.hp)),
      estimatedRangeMiles: optionalNumber(firstDefined(car.estimatedRangeMiles, car.range, car.rangeMiles)),
      seats,
      doors: optionalNumber(firstDefined(car.doors, car.doorCount)),
      luggageCapacity: optionalNumber(firstDefined(car.luggageCapacity, car.luggage)),
      bootCapacityLitres: optionalNumber(firstDefined(car.bootCapacityLitres, car.bootCapacity)),
      fuelEconomy: firstDefined(car.fuelEconomy, car.mpg),
      emissionsBand: firstDefined(car.emissionsBand, car.emissionBand),
      co2Emissions: firstDefined(car.co2Emissions, car.co2),
      baseDailyPrice: getBaseDailyPrice(car),
      imageUrl: getImageUrl(car, originalId),
      description: getDescription(car, make, model),
      features: [transmission, fuelType, `${seats} seats`].filter(Boolean),
      badges: [firstDefined(car.category, car.segment, car.vehicleClass), bodyType].filter(Boolean),
      isActive: firstDefined(car.isActive, car.active, true) !== false
    } as VehicleCatalogueItem;
  });

  return uniqueCatalogueItems(mapped);
}

export function buildFleetVehiclesFromLegacyData(
  catalogueItems: VehicleCatalogueItem[] = buildVehicleCatalogueFromLegacyData()
): FleetVehicle[] {
  const cars = findLegacyCars();
  const brands = findLegacyBrands();
  const colours = findLegacyColours();

  const fleetFromCars = cars.map((car, index) => {
    const make = getMake(car, brands);
    const model = getModel(car);
    const trim = firstDefined(car.trim, car.variant, car.version);
    const year = optionalNumber(firstDefined(car.year, car.modelYear));
    const originalId = toNumber(firstDefined(car.id, car.carId, car.CarId), index + 1);
    const imageUrl = getImageUrl(car, originalId);

    const catalogueMatch = catalogueItems.find(item =>
      normalise(item.make) === normalise(make) &&
      normalise(item.model) === normalise(model) &&
      normalise(item.trim) === normalise(trim) &&
      String(item.year || '') === String(year || '')
    ) || catalogueItems.find(item =>
      normalise(item.make) === normalise(make) &&
      normalise(item.model) === normalise(model) &&
      item.imageUrl === imageUrl
    ) || catalogueItems.find(item => item.id === originalId);

    return {
      id: index + 1,
      catalogueItemId: catalogueMatch?.id || originalId,
      registrationNumber: getRegistration(car, originalId),
      colour: getColour(car, colours),
      mileage: toNumber(firstDefined(car.mileage, car.kilometres, car.odometer), 10000 + (index * 1300)),
      status: firstDefined(car.status, car.availabilityStatus, true) === false ? 'inactive' : 'available',
      currentLocationId: toNumber(firstDefined(car.currentLocationId, car.pickupLocationId, car.locationId), (index % 3) + 1),
      lastServiceDate: firstDefined(car.lastServiceDate, car.serviceDate),
      nextServiceDueDate: firstDefined(car.nextServiceDueDate, car.nextServiceDate),
      notes: 'Migrated from legacy cars/brands/colours mock data.'
    } as FleetVehicle;
  });

  const usedCatalogueIds = new Set(fleetFromCars.map(item => item.catalogueItemId));
  const nextFleetStartId = fleetFromCars.length + 1;

  const generatedMissingUnits = catalogueItems
    .filter(item => !usedCatalogueIds.has(item.id))
    .map((item, index) => ({
      id: nextFleetStartId + index,
      catalogueItemId: item.id,
      registrationNumber: `CR${String(item.id).padStart(3, '0')} CAT`,
      colour: 'Unspecified',
      mileage: 9000 + (index * 1300),
      status: 'available',
      currentLocationId: (index % 3) + 1,
      notes: 'Generated fleet unit for migrated catalogue vehicle.'
    } as FleetVehicle));

  return [
    ...fleetFromCars,
    ...generatedMissingUnits
  ];
}

export function getLegacyVehicleMigrationDebugSummary() {
  const catalogue = buildVehicleCatalogueFromLegacyData();

  return {
    candidateArrays: allCandidateArrays().length,
    legacyCars: findLegacyCars().length,
    legacyBrands: findLegacyBrands().length,
    legacyColours: findLegacyColours().length,
    catalogueItems: catalogue.length,
    fleetVehicles: buildFleetVehiclesFromLegacyData(catalogue).length
  };
}
