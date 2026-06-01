export interface DemoVehicleCatalogueRecord {
  id?: number;
  make?: string;
  brandName?: string;
  brand?: string;
  model?: string;
  modelName?: string;
  displayName?: string;
  name?: string;
  title?: string;
  year?: number;
  modelYear?: number;
  category?: string;
  bodyType?: string;
  transmission?: string;
  gearbox?: string;
  fuelType?: string;
  fuel?: string;
  seats?: number;
  doors?: number;
  dailyPrice?: number;
  pricePerDay?: number;
  rentalPrice?: number;
  price?: number;
  imagePath?: string;
  imageUrl?: string;
  [key: string]: any;
}

const CATALOGUE_KEY = 'vehicleCatalogue';

const LEGACY_CAR_KEYS = [
  'cars',
  'rent-a-car-demo-cars',
  'rent-a-car-demo-vehicles',
  'rentalCars',
  'carList',
  'vehicles',
  'publicCars',
  'availableCars',
  'fleetCars'
];

const PRICE_KEYS = [
  'dailyPrice',
  'pricePerDay',
  'baseDailyPrice',
  'dailyRate',
  'dayRate',
  'rentalPrice',
  'rentalPricePerDay',
  'rentPrice',
  'price',
  'ratePerDay',
  'basePrice',
  'costPerDay'
];

const EXACT_PRICE_SEEDS: Array<{ match: string; price: number }> = [
  { match: 'peugeot 208 gt', price: 42 },
  { match: 'peugeot 3008 allure', price: 68 },
  { match: 'skoda enyaq iv', price: 82 },
  { match: 'range rover sport hse', price: 168 },
  { match: 'honda civic e:hev', price: 64 },
  { match: 'mercedes benz c class amg line', price: 96 },
  { match: 'mercedes-benz c-class amg line', price: 96 },
  { match: 'mercedes benz e class estate', price: 118 },
  { match: 'mercedes-benz e-class estate', price: 118 },
  { match: 'mercedes benz glc 300', price: 132 },
  { match: 'mercedes-benz glc 300', price: 132 },
  { match: 'bmw 3 series m sport', price: 92 },
  { match: 'bmw x3 xdrive', price: 124 },
  { match: 'bmw 5 series touring', price: 116 },
  { match: 'audi a3 sportback', price: 58 },
  { match: 'audi a4 avant', price: 76 },
  { match: 'audi q5 s line', price: 118 },
  { match: 'volkswagen golf', price: 56 },
  { match: 'volkswagen polo', price: 38 },
  { match: 'volkswagen tiguan', price: 86 },
  { match: 'ford fiesta', price: 36 },
  { match: 'ford focus', price: 48 },
  { match: 'ford kuga', price: 76 },
  { match: 'toyota yaris', price: 40 },
  { match: 'toyota corolla', price: 54 },
  { match: 'toyota rav4', price: 88 },
  { match: 'nissan qashqai', price: 72 },
  { match: 'nissan juke', price: 54 },
  { match: 'hyundai tucson', price: 78 },
  { match: 'hyundai kona', price: 62 },
  { match: 'kia sportage', price: 76 },
  { match: 'kia niro', price: 64 },
  { match: 'kia ev6', price: 98 },
  { match: 'tesla model 3', price: 118 },
  { match: 'tesla model y', price: 138 },
  { match: 'volvo xc40', price: 102 },
  { match: 'volvo xc60', price: 128 },
  { match: 'mini cooper', price: 54 },
  { match: 'renault clio', price: 38 },
  { match: 'renault captur', price: 56 },
  { match: 'vauxhall corsa', price: 36 },
  { match: 'vauxhall astra', price: 48 },
  { match: 'mazda cx-5', price: 84 },
  { match: 'mazda 3', price: 58 },
  { match: 'seat leon', price: 50 },
  { match: 'cupra formentor', price: 88 },
  { match: 'fiat 500', price: 34 },
  { match: 'jeep renegade', price: 70 },
  { match: 'land rover defender', price: 178 },
  { match: 'porsche macan', price: 185 }
];

export function repairDemoVehicleCatalogueData(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const catalogue = readArray<DemoVehicleCatalogueRecord>(CATALOGUE_KEY);
  if (!catalogue.length) {
    return;
  }

  const legacyCars = readMergedArrays<DemoVehicleCatalogueRecord>(LEGACY_CAR_KEYS);
  let changed = false;

  const repaired = catalogue.map((vehicle, index) => {
    const legacy = findLegacyVehicle(vehicle, legacyCars);
    const next: DemoVehicleCatalogueRecord = { ...vehicle };

    const name = resolveDisplayName(next, legacy);
    const make = resolveMake(next, legacy, name);
    const model = resolveModel(next, legacy, make, name);
    const year = firstPositiveNumber(next, ['year', 'modelYear', 'manufactureYear'])
      || firstPositiveNumber(legacy, ['year', 'modelYear', 'manufactureYear'])
      || inferYear(name, index);

    const category = resolveCategory(next, legacy, name);
    const transmission = firstText(next, ['transmission', 'gearbox'])
      || firstText(legacy, ['transmission', 'gearbox'])
      || inferTransmission(name);

    const fuelType = firstText(next, ['fuelType', 'fuel', 'engineType'])
      || firstText(legacy, ['fuelType', 'fuel', 'engineType'])
      || inferFuelType(name);

    const seats = firstPositiveNumber(next, ['seats', 'seatCount', 'passengers'])
      || firstPositiveNumber(legacy, ['seats', 'seatCount', 'passengers'])
      || inferSeats(name, category);

    const doors = firstPositiveNumber(next, ['doors', 'doorCount'])
      || firstPositiveNumber(legacy, ['doors', 'doorCount'])
      || inferDoors(name, category);

    const price = firstPositiveNumber(next, PRICE_KEYS)
      || firstPositiveNumber(legacy, PRICE_KEYS)
      || inferDailyPrice(name, make, model, category, fuelType, index);

    const image = firstText(next, ['imagePath', 'imageUrl', 'image', 'photoUrl'])
      || firstText(legacy, ['imagePath', 'imageUrl', 'image', 'photoUrl']);

    changed = fillText(next, 'displayName', name) || changed;
    changed = fillText(next, 'name', name) || changed;
    changed = fillText(next, 'make', make) || changed;
    changed = fillText(next, 'brandName', make) || changed;
    changed = fillText(next, 'model', model) || changed;
    changed = fillText(next, 'modelName', model) || changed;
    changed = fillNumber(next, 'year', year) || changed;
    changed = fillNumber(next, 'modelYear', year) || changed;
    changed = fillText(next, 'category', category) || changed;
    changed = fillText(next, 'bodyType', category) || changed;
    changed = fillText(next, 'transmission', transmission) || changed;
    changed = fillText(next, 'fuelType', fuelType) || changed;
    changed = fillNumber(next, 'seats', seats) || changed;
    changed = fillNumber(next, 'doors', doors) || changed;
    changed = fillNumber(next, 'dailyPrice', price) || changed;
    changed = fillNumber(next, 'pricePerDay', price) || changed;

    if (image && !isPlaceholderImage(image)) {
      changed = fillText(next, 'imagePath', image) || changed;
      changed = fillText(next, 'imageUrl', image) || changed;
    }

    return next;
  });

  const missingPrices = repaired.filter(vehicle => !firstPositiveNumber(vehicle, ['dailyPrice', 'pricePerDay'])).length;

  localStorage.setItem(CATALOGUE_KEY, JSON.stringify(repaired));
  localStorage.setItem('demoVehicleCataloguePriceRepairV3Complete', 'true');
  localStorage.setItem('demoVehicleCataloguePriceRepairV3MissingPrices', String(missingPrices));

  if (changed || missingPrices === 0) {
    mirrorCatalogueAliases(repaired);
  }
}

function mirrorCatalogueAliases(catalogue: DemoVehicleCatalogueRecord[]): void {
  ['vehicleCatalogueItems', 'rent-a-car-demo-vehicle-catalogue'].forEach(key => {
    const existing = readArray<DemoVehicleCatalogueRecord>(key);
    if (existing.length === catalogue.length || existing.length === 0) {
      localStorage.setItem(key, JSON.stringify(catalogue));
    }
  });
}

function resolveDisplayName(vehicle: DemoVehicleCatalogueRecord, legacy?: DemoVehicleCatalogueRecord): string {
  return firstText(vehicle, ['displayName', 'name', 'title'])
    || firstText(legacy, ['displayName', 'name', 'title'])
    || `${resolveMake(vehicle, legacy, '')} ${resolveModel(vehicle, legacy, resolveMake(vehicle, legacy, ''), '')}`.trim()
    || `Vehicle #${vehicle.id || ''}`.trim();
}

function resolveMake(vehicle: DemoVehicleCatalogueRecord, legacy: DemoVehicleCatalogueRecord | undefined, name: string): string {
  const explicit = firstText(vehicle, ['make', 'brandName', 'brand']) || firstText(legacy, ['make', 'brandName', 'brand']);
  if (explicit) {
    return explicit;
  }

  const clean = normaliseName(name);
  const brands = [
    'Mercedes-Benz', 'Mercedes', 'BMW', 'Audi', 'Volkswagen', 'VW', 'Peugeot', 'Skoda',
    'Range Rover', 'Land Rover', 'Honda', 'Toyota', 'Nissan', 'Hyundai', 'Kia', 'Ford',
    'Vauxhall', 'Renault', 'Tesla', 'Volvo', 'Mini', 'Mazda', 'Seat', 'Cupra', 'Fiat',
    'Jeep', 'Porsche', 'Lexus'
  ];

  const match = brands.find(brand => clean.includes(normaliseName(brand)));
  return match || 'Unknown make';
}

function resolveModel(vehicle: DemoVehicleCatalogueRecord, legacy: DemoVehicleCatalogueRecord | undefined, make: string, name: string): string {
  const explicit = firstText(vehicle, ['model', 'modelName']) || firstText(legacy, ['model', 'modelName']);
  if (explicit) {
    return explicit;
  }

  const cleanedName = String(name || '').replace(new RegExp(`^${escapeRegExp(make)}\\s*`, 'i'), '').trim();
  return cleanedName || '';
}

function resolveCategory(vehicle: DemoVehicleCatalogueRecord, legacy: DemoVehicleCatalogueRecord | undefined, name: string): string {
  const explicit = firstText(vehicle, ['category', 'bodyType', 'segment', 'vehicleType', 'class'])
    || firstText(legacy, ['category', 'bodyType', 'segment', 'vehicleType', 'class']);

  if (explicit && !['no category', 'uncategorised', 'uncategorized'].includes(normaliseName(explicit))) {
    return explicit;
  }

  const n = normaliseName(name);

  if (hasAny(n, ['estate', 'touring', 'avant', 'wagon'])) {
    return 'Estate';
  }

  if (hasAny(n, ['suv', 'x3', 'x5', 'q5', 'q7', 'glc', 'gle', '3008', 'qashqai', 'juke', 'tucson', 'kona', 'sportage', 'niro', 'rav4', 'tiguan', 'captur', 'kuga', 'xc40', 'xc60', 'cx 5', 'cx-5', 'formentor', 'renegade', 'defender', 'macan', 'model y'])) {
    return 'SUV';
  }

  if (hasAny(n, ['c class', 'e class', '3 series', '5 series', 'a4', 'corolla saloon'])) {
    return 'Saloon';
  }

  if (hasAny(n, ['fiesta', 'focus', 'golf', 'polo', 'a3', 'sportback', '208', 'civic', 'yaris', 'corolla', 'clio', 'corsa', 'astra', 'mazda 3', 'leon', 'mini', 'cooper', 'fiat 500'])) {
    return 'Hatchback';
  }

  if (hasAny(n, ['model 3'])) {
    return 'Electric saloon';
  }

  return 'Hatchback';
}

function inferTransmission(name: string): string {
  const n = normaliseName(name);
  if (hasAny(n, ['m sport', 'amg', 'tesla', 'ev6', 'enyaq', 'hybrid', 'e:hev', 'xdrive', 'glc', 'range rover'])) {
    return 'Automatic';
  }

  return 'Automatic';
}

function inferFuelType(name: string): string {
  const n = normaliseName(name);
  if (hasAny(n, ['tesla', 'enyaq', 'ev6', 'electric'])) {
    return 'Electric';
  }

  if (hasAny(n, ['hybrid', 'e:hev', 'phev', 'plug in', 'plug-in', 'niro'])) {
    return 'Hybrid';
  }

  return 'Petrol';
}

function inferSeats(name: string, category: string): number {
  const n = normaliseName(name);
  if (hasAny(n, ['mx 5', 'mx-5'])) {
    return 2;
  }

  if (hasAny(n, ['fiat 500', 'mini cooper'])) {
    return 4;
  }

  if (hasAny(n, ['defender 110', 'discovery', 'q7', 'x5'])) {
    return 7;
  }

  return category === 'SUV' || category === 'Estate' || category === 'Saloon' || category === 'Electric saloon' ? 5 : 5;
}

function inferDoors(name: string, category: string): number {
  const n = normaliseName(name);
  if (hasAny(n, ['mx 5', 'mx-5'])) {
    return 2;
  }

  if (category === 'Saloon' || category === 'Electric saloon') {
    return 4;
  }

  if (hasAny(n, ['fiat 500', 'mini cooper'])) {
    return 3;
  }

  return 5;
}

function inferYear(name: string, index: number): number {
  const n = normaliseName(name);
  if (hasAny(n, ['tesla', 'enyaq', 'ev6', 'glc 300', 'model y'])) {
    return 2024;
  }

  return 2021 + (index % 4);
}

function inferDailyPrice(name: string, make: string, model: string, category: string, fuelType: string, index: number): number {
  const n = normaliseName(`${name} ${make} ${model}`);

  const exact = EXACT_PRICE_SEEDS.find(seed => n.includes(normaliseName(seed.match)) || normaliseName(seed.match).includes(n));
  if (exact) {
    return exact.price;
  }

  let base = 52;

  if (category === 'Hatchback') {
    base = 46;
  } else if (category === 'Saloon') {
    base = 78;
  } else if (category === 'Estate') {
    base = 88;
  } else if (category === 'SUV') {
    base = 92;
  } else if (category === 'Electric saloon') {
    base = 112;
  }

  if (hasAny(n, ['mercedes', 'bmw', 'audi', 'volvo', 'lexus'])) {
    base += 28;
  }

  if (hasAny(n, ['range rover', 'land rover', 'porsche'])) {
    base += 72;
  }

  if (hasAny(n, ['amg', 'm sport', 's line', 'hse', 'xdrive'])) {
    base += 10;
  }

  if (fuelType === 'Electric') {
    base += 14;
  } else if (fuelType === 'Hybrid') {
    base += 8;
  }

  if (hasAny(n, ['fiesta', 'polo', 'corsa', 'clio', 'yaris', 'fiat 500'])) {
    base = Math.min(base, 42);
  }

  return Math.max(34, Math.round(base + (index % 5) * 2));
}

function findLegacyVehicle(vehicle: DemoVehicleCatalogueRecord, legacyCars: DemoVehicleCatalogueRecord[]): DemoVehicleCatalogueRecord | undefined {
  const ids = [vehicle.id, vehicle.carId, vehicle.legacyCarId, vehicle.originalCarId, vehicle.vehicleId]
    .map(value => Number(value || 0))
    .filter(Boolean);

  const exact = legacyCars.find(car => ids.includes(Number(car.id || 0)));
  if (exact) {
    return exact;
  }

  const display = normaliseName(firstText(vehicle, ['displayName', 'name', 'title']) || `${vehicle.make || vehicle.brandName || ''} ${vehicle.model || vehicle.modelName || ''}`);
  if (!display) {
    return undefined;
  }

  return legacyCars.find(car => {
    const legacyDisplay = normaliseName(firstText(car, ['displayName', 'name', 'title']) || `${car.make || car.brandName || ''} ${car.model || car.modelName || ''}`);
    return legacyDisplay === display || legacyDisplay.includes(display) || display.includes(legacyDisplay);
  });
}

function fillText(target: DemoVehicleCatalogueRecord, key: string, value: string): boolean {
  if (!value || ['unknown make', 'no category', 'uncategorised', 'uncategorized'].includes(normaliseName(value))) {
    return false;
  }

  if (!String(target[key] ?? '').trim() || ['no category', 'uncategorised', 'uncategorized'].includes(normaliseName(target[key]))) {
    target[key] = value;
    return true;
  }

  return false;
}

function fillNumber(target: DemoVehicleCatalogueRecord, key: string, value: number): boolean {
  if (!Number.isFinite(value) || value <= 0) {
    return false;
  }

  if (!Number(target[key])) {
    target[key] = value;
    return true;
  }

  return false;
}

function firstText(source: any, keys: string[]): string {
  if (!source) {
    return '';
  }

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return '';
}

function firstPositiveNumber(source: any, keys: string[]): number {
  if (!source) {
    return 0;
  }

  for (const key of keys) {
    const value = source[key];
    const parsed = parseNumber(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 0;
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return 0;
  }

  return Number(String(value).replace(/[^0-9.\-]/g, ''));
}

function readArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

function readMergedArrays<T>(keys: string[]): T[] {
  const merged: T[] = [];
  const seen = new Set<string>();

  keys.forEach(key => {
    readArray<T>(key).forEach((item: T & { id?: number }, index: number) => {
      const fingerprint = `${key}:${item.id ?? index}:${JSON.stringify(item).slice(0, 120)}`;
      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        merged.push(item);
      }
    });
  });

  return merged;
}

function hasAny(value: string, needles: string[]): boolean {
  return needles.some(needle => value.includes(normaliseName(needle)));
}

function normaliseName(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\w]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isPlaceholderImage(value: string): boolean {
  return normaliseName(value).includes('placeholder');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
