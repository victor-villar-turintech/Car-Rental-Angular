import { Component, OnInit } from '@angular/core';

interface AdminCatalogueVehicle {
  id: number;
  make?: string;
  brandName?: string;
  model?: string;
  modelName?: string;
  displayName?: string;
  name?: string;
  title?: string;
  year?: number;
  modelYear?: number;
  category?: string;
  bodyType?: string;
  seats?: number;
  doors?: number;
  transmission?: string;
  fuelType?: string;
  dailyPrice?: number;
  pricePerDay?: number;
  imagePath?: string;
  imageUrl?: string;
  description?: string;
  status?: string;
  isActive?: boolean;
  [key: string]: any;
}

interface AdminFleetVehicle {
  id: number;
  catalogueItemId?: number;
  vehicleCatalogueId?: number;
  vehicleId?: number;
  registrationNumber?: string;
  status?: string;
  isActive?: boolean;
  [key: string]: any;
}

interface AdminBooking {
  id?: number;
  carId?: number;
  catalogueItemId?: number;
  fleetVehicleId?: number;
  bookingReference?: string;
  status?: string;
  bookingStatus?: string;
  [key: string]: any;
}

interface LegacyRecord {
  id?: number;
  name?: string;
  title?: string;
  brandId?: number;
  brandName?: string;
  make?: string;
  model?: string;
  modelName?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-admin-vehicle-catalogue',
  templateUrl: './vehicle-catalogue.component.html',
  styleUrls: ['./vehicle-catalogue.component.css']
})
export class VehicleCatalogueComponent implements OnInit {
  readonly catalogueStorageKey = 'vehicleCatalogue';
  readonly fleetStorageKey = 'fleetVehicles';
  readonly bookingsStorageKey = 'rent-a-car-demo-bookings';
  readonly maxImageBytes = 4 * 1024 * 1024;

  readonly legacyCarKeys = [
    'cars',
    'rent-a-car-demo-cars',
    'rentalCars',
    'carList',
    'vehicles',
    'publicCars'
  ];

  readonly legacyBrandKeys = [
    'brands',
    'rent-a-car-demo-brands',
    'carBrands'
  ];

  readonly legacyColourKeys = [
    'colors',
    'colours',
    'rent-a-car-demo-colors',
    'carColors'
  ];

  readonly priceKeys = [
    'dailyPrice',
    'pricePerDay',
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

  catalogue: AdminCatalogueVehicle[] = [];
  fleetVehicles: AdminFleetVehicle[] = [];
  bookings: AdminBooking[] = [];
  legacyCars: LegacyRecord[] = [];
  legacyBrands: LegacyRecord[] = [];
  legacyColours: LegacyRecord[] = [];

  searchTerm = '';
  statusFilter = 'all';
  categoryFilter = 'all';
  sortBy = 'make';

  isFormOpen = false;
  isEditing = false;
  formError = '';
  formSuccess = '';

  catalogueForm: AdminCatalogueVehicle = this.createEmptyVehicle();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.legacyCars = this.readMergedJsonArrays<LegacyRecord>(this.legacyCarKeys);
    this.legacyBrands = this.readMergedJsonArrays<LegacyRecord>(this.legacyBrandKeys);
    this.legacyColours = this.readMergedJsonArrays<LegacyRecord>(this.legacyColourKeys);

    this.catalogue = this.readJson<AdminCatalogueVehicle[]>(this.catalogueStorageKey, []);
    this.fleetVehicles = this.readJson<AdminFleetVehicle[]>(this.fleetStorageKey, []);
    this.bookings = this.readJson<AdminBooking[]>(this.bookingsStorageKey, []);

    this.enrichCatalogueFromLegacyData();
  }

  get filteredCatalogue(): AdminCatalogueVehicle[] {
    const term = this.normalise(this.searchTerm);

    return this.catalogue
      .filter(vehicle => {
        const status = this.getVehicleStatus(vehicle);
        const category = this.getCategory(vehicle);
        const matchesStatus = this.statusFilter === 'all' || status === this.statusFilter;
        const matchesCategory = this.categoryFilter === 'all' || this.normalise(category) === this.normalise(this.categoryFilter);

        const haystack = [
          vehicle.id,
          this.getMake(vehicle),
          this.getModel(vehicle),
          this.getDisplayName(vehicle),
          this.getYear(vehicle),
          category,
          this.getTransmission(vehicle),
          this.getFuelType(vehicle),
          this.getDailyPrice(vehicle)
        ].join(' ');

        return matchesStatus && matchesCategory && this.normalise(haystack).includes(term);
      })
      .sort((a, b) => this.compareCatalogueItems(a, b));
  }

  get activeCount(): number {
    return this.catalogue.filter(vehicle => this.getVehicleStatus(vehicle) === 'active').length;
  }

  get inactiveCount(): number {
    return this.catalogue.filter(vehicle => this.getVehicleStatus(vehicle) === 'inactive').length;
  }

  get linkedFleetCount(): number {
    return this.fleetVehicles.filter(unit => this.getCatalogueIdFromFleet(unit) > 0).length;
  }

  get missingPriceCount(): number {
    return this.catalogue.filter(vehicle => this.getDailyPrice(vehicle) <= 0).length;
  }

  get categories(): string[] {
    const values = this.catalogue
      .map(vehicle => this.getCategory(vehicle))
      .filter(value => value && value !== 'Uncategorised');
    return Array.from(new Set(values)).sort();
  }

  startAdd(): void {
    this.isFormOpen = true;
    this.isEditing = false;
    this.formError = '';
    this.formSuccess = '';
    this.catalogueForm = this.createEmptyVehicle();
  }

  startEdit(vehicle: AdminCatalogueVehicle): void {
    this.isFormOpen = true;
    this.isEditing = true;
    this.formError = '';
    this.formSuccess = '';
    this.catalogueForm = { ...vehicle };
    this.catalogueForm.make = this.getMake(vehicle);
    this.catalogueForm.model = this.getModel(vehicle);
    this.catalogueForm.year = this.getYear(vehicle);
    this.catalogueForm.category = this.getCategory(vehicle);
    this.catalogueForm.seats = this.getSeats(vehicle);
    this.catalogueForm.doors = this.getDoors(vehicle);
    this.catalogueForm.transmission = this.getTransmission(vehicle);
    this.catalogueForm.fuelType = this.getFuelType(vehicle);
    this.catalogueForm.dailyPrice = this.getDailyPrice(vehicle);
    this.catalogueForm.pricePerDay = this.getDailyPrice(vehicle);
    this.catalogueForm.isActive = this.getVehicleStatus(vehicle) === 'active';
    this.catalogueForm.status = this.getVehicleStatus(vehicle);
  }

  cancelForm(): void {
    this.isFormOpen = false;
    this.isEditing = false;
    this.formError = '';
    this.formSuccess = '';
    this.catalogueForm = this.createEmptyVehicle();
  }

  saveVehicle(): void {
    this.formError = '';
    this.formSuccess = '';

    const validationError = this.validateVehicleForm();
    if (validationError) {
      this.formError = validationError;
      return;
    }

    const now = new Date().toISOString();
    const make = this.catalogueForm.make?.trim() || '';
    const model = this.catalogueForm.model?.trim() || '';
    const price = Number(this.catalogueForm.dailyPrice || this.catalogueForm.pricePerDay || 0);

    const form = {
      ...this.catalogueForm,
      make,
      brandName: make,
      model,
      modelName: model,
      displayName: `${make} ${model}`.trim(),
      name: `${make} ${model}`.trim(),
      year: Number(this.catalogueForm.year || this.catalogueForm.modelYear || new Date().getFullYear()),
      modelYear: Number(this.catalogueForm.year || this.catalogueForm.modelYear || new Date().getFullYear()),
      category: this.catalogueForm.category?.trim() || 'Uncategorised',
      seats: Number(this.catalogueForm.seats || 5),
      doors: Number(this.catalogueForm.doors || 5),
      transmission: this.catalogueForm.transmission || 'Automatic',
      fuelType: this.catalogueForm.fuelType || 'Petrol',
      dailyPrice: price,
      pricePerDay: price,
      status: this.catalogueForm.isActive === false ? 'inactive' : 'active',
      isActive: this.catalogueForm.isActive !== false,
      updatedAt: now
    };

    if (this.isEditing) {
      this.catalogue = this.catalogue.map(vehicle =>
        Number(vehicle.id) === Number(form.id)
          ? { ...vehicle, ...form }
          : vehicle
      );
      this.formSuccess = 'Vehicle catalogue item updated.';
    } else {
      const nextId = this.getNextId(this.catalogue);
      this.catalogue = [
        ...this.catalogue,
        {
          ...form,
          id: nextId,
          createdAt: now
        }
      ];
      this.formSuccess = 'Vehicle catalogue item added.';
    }

    this.persistCatalogue();
    this.loadData();
    this.cancelForm();
  }

  deactivateVehicle(vehicle: AdminCatalogueVehicle): void {
    this.formError = '';
    this.formSuccess = '';

    if (this.hasBlockingBookingForCatalogue(vehicle.id)) {
      this.formError = 'This catalogue item has an active booking and cannot be deactivated.';
      return;
    }

    if (this.hasActiveFleetUnits(vehicle.id)) {
      this.formError = 'Deactivate or remove active fleet units before deactivating this catalogue item.';
      return;
    }

    this.catalogue = this.catalogue.map(item =>
      Number(item.id) === Number(vehicle.id)
        ? { ...item, status: 'inactive', isActive: false, updatedAt: new Date().toISOString() }
        : item
    );

    this.persistCatalogue();
    this.loadData();
    this.formSuccess = 'Catalogue item deactivated.';
  }

  reactivateVehicle(vehicle: AdminCatalogueVehicle): void {
    this.catalogue = this.catalogue.map(item =>
      Number(item.id) === Number(vehicle.id)
        ? { ...item, status: 'active', isActive: true, updatedAt: new Date().toISOString() }
        : item
    );

    this.persistCatalogue();
    this.loadData();
    this.formSuccess = 'Catalogue item reactivated.';
  }

  deleteVehicle(vehicle: AdminCatalogueVehicle): void {
    this.formError = '';
    this.formSuccess = '';

    if (this.hasAnyFleetUnits(vehicle.id)) {
      this.formError = 'This catalogue item is linked to fleet units. Delete/deactivate those units first.';
      return;
    }

    if (this.hasAnyBookingForCatalogue(vehicle.id)) {
      this.formError = 'This catalogue item is linked to booking history and cannot be deleted.';
      return;
    }

    const confirmed = window.confirm(`Delete ${this.getDisplayName(vehicle)} permanently from the catalogue?`);
    if (!confirmed) {
      return;
    }

    this.catalogue = this.catalogue.filter(item => Number(item.id) !== Number(vehicle.id));
    this.persistCatalogue();
    this.loadData();
    this.formSuccess = 'Catalogue item deleted.';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];

    if (!file) {
      return;
    }

    this.formError = '';

    if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
      this.formError = 'Image must be PNG, JPG, JPEG, or WebP.';
      input.value = '';
      return;
    }

    if (file.size > this.maxImageBytes) {
      this.formError = 'Image must be 4 MB or smaller.';
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const image = new Image();

      image.onload = () => {
        if (image.width !== 1024 || image.height !== 1024) {
          this.formError = `Image must be exactly 1024x1024. Selected image is ${image.width}x${image.height}.`;
          input.value = '';
          return;
        }

        this.catalogueForm.imagePath = dataUrl;
        this.catalogueForm.imageUrl = dataUrl;
      };

      image.onerror = () => {
        this.formError = 'Could not read selected image.';
        input.value = '';
      };

      image.src = dataUrl;
    };

    reader.readAsDataURL(file);
  }

  getDisplayName(vehicle: AdminCatalogueVehicle): string {
    const legacy = this.getLegacyCar(vehicle);
    const explicit = this.firstText(vehicle, ['displayName', 'name', 'title']) || this.firstText(legacy, ['displayName', 'name', 'title']);
    if (explicit) {
      return explicit;
    }

    return `${this.getMake(vehicle)} ${this.getModel(vehicle)}`.trim() || `Vehicle #${vehicle.id}`;
  }

  getMake(vehicle: AdminCatalogueVehicle): string {
    const legacy = this.getLegacyCar(vehicle);
    return this.firstText(vehicle, ['make', 'brandName', 'brand'])
      || this.firstText(legacy, ['make', 'brandName', 'brand'])
      || this.getBrandName(vehicle)
      || 'Unknown make';
  }

  getModel(vehicle: AdminCatalogueVehicle): string {
    const legacy = this.getLegacyCar(vehicle);
    return this.firstText(vehicle, ['model', 'modelName'])
      || this.firstText(legacy, ['model', 'modelName'])
      || '';
  }

  getYear(vehicle: AdminCatalogueVehicle): number {
    const legacy = this.getLegacyCar(vehicle);
    return this.firstNumber(vehicle, ['year', 'modelYear', 'manufactureYear'], false)
      || this.firstNumber(legacy, ['year', 'modelYear', 'manufactureYear'], false)
      || new Date().getFullYear();
  }

  getCategory(vehicle: AdminCatalogueVehicle): string {
    const legacy = this.getLegacyCar(vehicle);
    return this.firstText(vehicle, ['category', 'bodyType', 'segment', 'vehicleType', 'class'])
      || this.firstText(legacy, ['category', 'bodyType', 'segment', 'vehicleType', 'class'])
      || 'Uncategorised';
  }

  getTransmission(vehicle: AdminCatalogueVehicle): string {
    const legacy = this.getLegacyCar(vehicle);
    return this.firstText(vehicle, ['transmission', 'gearbox'])
      || this.firstText(legacy, ['transmission', 'gearbox'])
      || 'Automatic';
  }

  getFuelType(vehicle: AdminCatalogueVehicle): string {
    const legacy = this.getLegacyCar(vehicle);
    return this.firstText(vehicle, ['fuelType', 'fuel', 'engineType'])
      || this.firstText(legacy, ['fuelType', 'fuel', 'engineType'])
      || 'Petrol';
  }

  getSeats(vehicle: AdminCatalogueVehicle): number {
    const legacy = this.getLegacyCar(vehicle);
    return this.firstNumber(vehicle, ['seats', 'seatCount', 'passengers'], true)
      || this.firstNumber(legacy, ['seats', 'seatCount', 'passengers'], true)
      || 5;
  }

  getDoors(vehicle: AdminCatalogueVehicle): number {
    const legacy = this.getLegacyCar(vehicle);
    return this.firstNumber(vehicle, ['doors', 'doorCount'], true)
      || this.firstNumber(legacy, ['doors', 'doorCount'], true)
      || 5;
  }

  getDailyPrice(vehicle: AdminCatalogueVehicle): number {
    const legacy = this.getLegacyCar(vehicle);
    return this.firstNumber(vehicle, this.priceKeys, true)
      || this.firstNumber(legacy, this.priceKeys, true)
      || 0;
  }

  formatDailyPrice(vehicle: AdminCatalogueVehicle): string {
    const price = this.getDailyPrice(vehicle);
    return price > 0 ? `£${price}` : 'Price missing';
  }

  hasResolvedPrice(vehicle: AdminCatalogueVehicle): boolean {
    return this.getDailyPrice(vehicle) > 0;
  }

  getVehicleStatus(vehicle: AdminCatalogueVehicle): string {
    if (vehicle.status) {
      return this.normalise(vehicle.status);
    }

    return vehicle.isActive === false ? 'inactive' : 'active';
  }

  getImage(vehicle: AdminCatalogueVehicle): string {
    const legacy = this.getLegacyCar(vehicle);
    return this.firstText(vehicle, ['imagePath', 'imageUrl', 'image', 'photoUrl'])
      || this.firstText(legacy, ['imagePath', 'imageUrl', 'image', 'photoUrl'])
      || 'assets/images/car-placeholder.png';
  }

  getFleetCount(vehicleId: number): number {
    return this.fleetVehicles.filter(unit => this.getCatalogueIdFromFleet(unit) === Number(vehicleId)).length;
  }

  getAvailableFleetCount(vehicleId: number): number {
    return this.fleetVehicles.filter(unit =>
      this.getCatalogueIdFromFleet(unit) === Number(vehicleId)
      && this.normalise(unit.status || 'available') === 'available'
      && unit.isActive !== false
    ).length;
  }

  hasAnyFleetUnits(vehicleId: number): boolean {
    return this.fleetVehicles.some(unit => this.getCatalogueIdFromFleet(unit) === Number(vehicleId));
  }

  hasActiveFleetUnits(vehicleId: number): boolean {
    return this.fleetVehicles.some(unit =>
      this.getCatalogueIdFromFleet(unit) === Number(vehicleId)
      && unit.isActive !== false
      && this.normalise(unit.status || 'available') !== 'inactive'
    );
  }

  hasAnyBookingForCatalogue(vehicleId: number): boolean {
    return this.bookings.some(booking =>
      Number(booking.catalogueItemId || booking.carId || 0) === Number(vehicleId)
    );
  }

  hasBlockingBookingForCatalogue(vehicleId: number): boolean {
    return this.bookings.some(booking =>
      Number(booking.catalogueItemId || booking.carId || 0) === Number(vehicleId)
      && this.isBlockingBooking(booking)
    );
  }

  isBlockingBooking(booking: AdminBooking): boolean {
    const status = this.normalise(booking.status || booking.bookingStatus || '');
    return ['pending', 'confirmed', 'paid', 'active'].includes(status);
  }

  private enrichCatalogueFromLegacyData(): void {
    let changed = false;

    this.catalogue = this.catalogue.map(vehicle => {
      const legacy = this.getLegacyCar(vehicle);
      const enriched: AdminCatalogueVehicle = { ...vehicle };

      changed = this.fillText(enriched, 'make', this.getMake(vehicle)) || changed;
      changed = this.fillText(enriched, 'brandName', this.getMake(vehicle)) || changed;
      changed = this.fillText(enriched, 'model', this.getModel(vehicle)) || changed;
      changed = this.fillText(enriched, 'modelName', this.getModel(vehicle)) || changed;
      changed = this.fillText(enriched, 'displayName', this.getDisplayName(vehicle)) || changed;
      changed = this.fillNumber(enriched, 'year', this.getYear(vehicle)) || changed;
      changed = this.fillNumber(enriched, 'modelYear', this.getYear(vehicle)) || changed;
      changed = this.fillText(enriched, 'category', this.getCategory(vehicle)) || changed;
      changed = this.fillText(enriched, 'transmission', this.getTransmission(vehicle)) || changed;
      changed = this.fillText(enriched, 'fuelType', this.getFuelType(vehicle)) || changed;
      changed = this.fillNumber(enriched, 'seats', this.getSeats(vehicle)) || changed;
      changed = this.fillNumber(enriched, 'doors', this.getDoors(vehicle)) || changed;

      const price = this.firstNumber(vehicle, this.priceKeys, true) || this.firstNumber(legacy, this.priceKeys, true);
      if (price > 0) {
        changed = this.fillNumber(enriched, 'dailyPrice', price) || changed;
        changed = this.fillNumber(enriched, 'pricePerDay', price) || changed;
      }

      const image = this.getImage(vehicle);
      if (image && !image.includes('car-placeholder')) {
        changed = this.fillText(enriched, 'imagePath', image) || changed;
      }

      return enriched;
    });

    if (changed) {
      this.persistCatalogue();
    }
  }

  private fillText(target: AdminCatalogueVehicle, key: string, value: string): boolean {
    if (!value || value === 'Unknown make' || value === 'Uncategorised') {
      return false;
    }

    if (!String(target[key] ?? '').trim()) {
      target[key] = value;
      return true;
    }

    return false;
  }

  private fillNumber(target: AdminCatalogueVehicle, key: string, value: number): boolean {
    if (!Number.isFinite(value) || value <= 0) {
      return false;
    }

    if (!Number(target[key])) {
      target[key] = value;
      return true;
    }

    return false;
  }

  private validateVehicleForm(): string {
    if (!this.catalogueForm.make?.trim()) {
      return 'Make is required.';
    }

    if (!this.catalogueForm.model?.trim()) {
      return 'Model is required.';
    }

    if (!Number(this.catalogueForm.year) || Number(this.catalogueForm.year) < 1980) {
      return 'A valid model year is required.';
    }

    if (!this.catalogueForm.category?.trim()) {
      return 'Category is required.';
    }

    if (!Number(this.catalogueForm.dailyPrice) || Number(this.catalogueForm.dailyPrice) <= 0) {
      return 'Daily price must be greater than zero.';
    }

    return '';
  }

  private compareCatalogueItems(a: AdminCatalogueVehicle, b: AdminCatalogueVehicle): number {
    switch (this.sortBy) {
      case 'price-low':
        return this.getDailyPrice(a) - this.getDailyPrice(b);
      case 'price-high':
        return this.getDailyPrice(b) - this.getDailyPrice(a);
      case 'year-new':
        return this.getYear(b) - this.getYear(a);
      case 'availability':
        return this.getAvailableFleetCount(b.id) - this.getAvailableFleetCount(a.id);
      case 'make':
      default:
        return this.getDisplayName(a).localeCompare(this.getDisplayName(b));
    }
  }

  private getCatalogueIdFromFleet(unit: AdminFleetVehicle): number {
    return Number(unit.catalogueItemId || unit.vehicleCatalogueId || unit.vehicleId || 0);
  }

  private getLegacyCar(vehicle: AdminCatalogueVehicle | undefined): LegacyRecord | undefined {
    if (!vehicle) {
      return undefined;
    }

    const ids = [
      vehicle.id,
      vehicle.carId,
      vehicle.legacyCarId,
      vehicle.originalCarId,
      vehicle.vehicleId
    ].map(value => Number(value || 0)).filter(Boolean);

    const exact = this.legacyCars.find(car => ids.includes(Number(car.id || 0)));
    if (exact) {
      return exact;
    }

    const display = this.normalise(this.firstText(vehicle, ['displayName', 'name', 'title']) || `${vehicle.make || vehicle.brandName || ''} ${vehicle.model || vehicle.modelName || ''}`);
    if (!display) {
      return undefined;
    }

    return this.legacyCars.find(car => {
      const legacyDisplay = this.normalise(this.firstText(car, ['displayName', 'name', 'title']) || `${car.make || car.brandName || this.getBrandNameFromLegacyCar(car)} ${car.model || car.modelName || ''}`);
      return legacyDisplay === display || legacyDisplay.includes(display) || display.includes(legacyDisplay);
    });
  }

  private getBrandName(vehicle: AdminCatalogueVehicle): string {
    const brandId = Number(vehicle.brandId || 0);
    const brand = this.legacyBrands.find(item => Number(item.id || 0) === brandId);
    return this.firstText(brand, ['name', 'brandName', 'title']);
  }

  private getBrandNameFromLegacyCar(car: LegacyRecord | undefined): string {
    if (!car) {
      return '';
    }

    const explicit = this.firstText(car, ['brandName', 'make', 'brand']);
    if (explicit) {
      return explicit;
    }

    const brandId = Number(car.brandId || 0);
    const brand = this.legacyBrands.find(item => Number(item.id || 0) === brandId);
    return this.firstText(brand, ['name', 'brandName', 'title']);
  }

  private persistCatalogue(): void {
    localStorage.setItem(this.catalogueStorageKey, JSON.stringify(this.catalogue));
  }

  private createEmptyVehicle(): AdminCatalogueVehicle {
    return {
      id: 0,
      make: '',
      brandName: '',
      model: '',
      modelName: '',
      displayName: '',
      name: '',
      year: new Date().getFullYear(),
      modelYear: new Date().getFullYear(),
      category: 'SUV',
      seats: 5,
      doors: 5,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      dailyPrice: 95,
      pricePerDay: 95,
      imagePath: '',
      imageUrl: '',
      description: '',
      status: 'active',
      isActive: true
    };
  }

  private firstText(source: any, keys: string[]): string {
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

  private firstNumber(source: any, keys: string[], positiveOnly: boolean): number {
    if (!source) {
      return 0;
    }

    for (const key of keys) {
      const value = source[key];
      if (value === undefined || value === null || value === '') {
        continue;
      }

      const parsed = this.parseNumber(value);
      if (Number.isFinite(parsed) && (!positiveOnly || parsed > 0)) {
        return parsed;
      }
    }

    return 0;
  }

  private parseNumber(value: unknown): number {
    if (typeof value === 'number') {
      return value;
    }

    const cleaned = String(value).replace(/[^0-9.\-]/g, '');
    return Number(cleaned);
  }

  private getNextId(items: Array<{ id?: number }>): number {
    return items.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) + 1;
  }

  private readJson<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : fallback;
    } catch {
      return fallback;
    }
  }

  private readMergedJsonArrays<T>(keys: string[]): T[] {
    const merged: T[] = [];
    const seen = new Set<string>();

    keys.forEach(key => {
      try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) {
          return;
        }

        parsed.forEach((item: T & { id?: number }, index: number) => {
          const fingerprint = `${item.id ?? index}:${JSON.stringify(item).slice(0, 80)}`;
          if (!seen.has(fingerprint)) {
            seen.add(fingerprint);
            merged.push(item);
          }
        });
      } catch {
        // Ignore malformed legacy demo data.
      }
    });

    return merged;
  }

  private normalise(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
  }
}
