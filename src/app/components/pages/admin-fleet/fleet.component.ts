import { Component, OnInit } from '@angular/core';
import { CsvColumn, downloadCsv, timestampedFilename } from '../../../helpers/csv-export';

interface AdminCatalogueVehicle {
  id: number;
  make?: string;
  brandName?: string;
  model?: string;
  modelName?: string;
  displayName?: string;
  name?: string;
  year?: number;
  modelYear?: number;
  dailyPrice?: number;
  pricePerDay?: number;
  imagePath?: string;
  imageUrl?: string;
  [key: string]: any;
}

interface AdminFleetVehicle {
  id: number;
  catalogueItemId?: number;
  vehicleCatalogueId?: number;
  vehicleId?: number;
  registrationNumber?: string;
  colour?: string;
  colorName?: string;
  mileage?: number;
  locationId?: number;
  rentalLocationId?: number;
  locationName?: string;
  status?: string;
  serviceStatus?: string;
  nextServiceDue?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface AdminRentalLocation {
  id: number;
  name?: string;
  branchName?: string;
  city?: string;
  [key: string]: any;
}

interface AdminBooking {
  id?: number;
  bookingReference?: string;
  customerName?: string;
  name?: string;
  status?: string;
  bookingStatus?: string;
  returnDate?: string;
  fleetVehicleId?: number;
  registrationNumber?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-admin-fleet',
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.css']
})
export class FleetComponent implements OnInit {
  readonly catalogueStorageKey = 'vehicleCatalogue';
  readonly fleetStorageKey = 'fleetVehicles';
  readonly locationsStorageKey = 'rentalLocations';
  readonly bookingsStorageKey = 'rent-a-car-demo-bookings';

  catalogue: AdminCatalogueVehicle[] = [];
  fleetVehicles: AdminFleetVehicle[] = [];
  rentalLocations: AdminRentalLocation[] = [];
  bookings: AdminBooking[] = [];

  searchTerm = '';
  statusFilter = 'all';
  locationFilter = 'all';
  sortBy = 'registration';

  isFormOpen = false;
  isEditing = false;
  formError = '';
  formSuccess = '';

  fleetForm: AdminFleetVehicle = this.createEmptyFleetUnit();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.catalogue = this.readJson<AdminCatalogueVehicle[]>(this.catalogueStorageKey, []);
    this.fleetVehicles = this.readJson<AdminFleetVehicle[]>(this.fleetStorageKey, []);
    this.rentalLocations = this.readJson<AdminRentalLocation[]>(this.locationsStorageKey, []);
    this.bookings = this.readJson<AdminBooking[]>(this.bookingsStorageKey, []);
  }

  get filteredFleet(): AdminFleetVehicle[] {
    const term = this.normalise(this.searchTerm);

    return this.fleetVehicles
      .filter(unit => {
        const status = this.getFleetStatus(unit);
        const locationId = this.getLocationId(unit);

        const matchesStatus = this.statusFilter === 'all' || status === this.statusFilter;
        const matchesLocation = this.locationFilter === 'all' || String(locationId) === String(this.locationFilter);

        const vehicle = this.getCatalogueVehicle(unit);
        const activeBooking = this.getActiveBooking(unit);

        const haystack = [
          unit.id,
          unit.registrationNumber,
          this.getVehicleDisplayName(vehicle),
          this.getColour(unit),
          unit.mileage,
          this.getLocationName(unit),
          status,
          unit.serviceStatus,
          unit.nextServiceDue,
          activeBooking?.bookingReference,
          activeBooking?.customerName,
          activeBooking?.name
        ].join(' ');

        return matchesStatus && matchesLocation && this.normalise(haystack).includes(term);
      })
      .sort((a, b) => this.compareFleetUnits(a, b));
  }

  get availableCount(): number {
    return this.fleetVehicles.filter(unit => this.getFleetStatus(unit) === 'available').length;
  }

  get bookedCount(): number {
    return this.fleetVehicles.filter(unit => this.getFleetStatus(unit) === 'booked').length;
  }

  get maintenanceCount(): number {
    return this.fleetVehicles.filter(unit => this.getFleetStatus(unit) === 'maintenance').length;
  }

  get inactiveCount(): number {
    return this.fleetVehicles.filter(unit => this.getFleetStatus(unit) === 'inactive').length;
  }

  startAdd(): void {
    this.isFormOpen = true;
    this.isEditing = false;
    this.formError = '';
    this.formSuccess = '';
    this.fleetForm = this.createEmptyFleetUnit();
  }

  startEdit(unit: AdminFleetVehicle): void {
    this.isFormOpen = true;
    this.isEditing = true;
    this.formError = '';
    this.formSuccess = '';
    this.fleetForm = { ...unit };
    this.fleetForm.catalogueItemId = this.getCatalogueId(unit);
    this.fleetForm.locationId = this.getLocationId(unit);
    this.fleetForm.colour = this.getColour(unit);
    this.fleetForm.status = this.getFleetStatus(unit);
  }

  cancelForm(): void {
    this.isFormOpen = false;
    this.isEditing = false;
    this.formError = '';
    this.formSuccess = '';
    this.fleetForm = this.createEmptyFleetUnit();
  }

  saveFleetUnit(): void {
    this.formError = '';
    this.formSuccess = '';

    const validationError = this.validateFleetForm();
    if (validationError) {
      this.formError = validationError;
      return;
    }

    const now = new Date().toISOString();
    const location = this.rentalLocations.find(item => Number(item.id) === Number(this.fleetForm.locationId));
    const catalogueId = Number(this.fleetForm.catalogueItemId);

    const form = {
      ...this.fleetForm,
      catalogueItemId: catalogueId,
      vehicleCatalogueId: catalogueId,
      vehicleId: catalogueId,
      registrationNumber: String(this.fleetForm.registrationNumber || '').trim().toUpperCase(),
      colour: String(this.fleetForm.colour || '').trim(),
      colorName: String(this.fleetForm.colour || '').trim(),
      mileage: Number(this.fleetForm.mileage || 0),
      locationId: Number(this.fleetForm.locationId || 0),
      rentalLocationId: Number(this.fleetForm.locationId || 0),
      locationName: location ? this.getRentalLocationName(location) : this.fleetForm.locationName,
      status: this.normalise(this.fleetForm.status || 'available'),
      isActive: this.normalise(this.fleetForm.status || 'available') !== 'inactive',
      updatedAt: now
    };

    if (this.isEditing) {
      this.fleetVehicles = this.fleetVehicles.map(unit =>
        Number(unit.id) === Number(form.id)
          ? { ...unit, ...form }
          : unit
      );
      this.formSuccess = 'Fleet unit updated.';
    } else {
      const nextId = this.getNextId(this.fleetVehicles);
      this.fleetVehicles = [
        ...this.fleetVehicles,
        {
          ...form,
          id: nextId,
          createdAt: now
        }
      ];
      this.formSuccess = 'Fleet unit added.';
    }

    this.persistFleet();
    this.loadData();
    this.cancelForm();
  }

  deactivateFleetUnit(unit: AdminFleetVehicle): void {
    this.formError = '';
    this.formSuccess = '';

    if (this.hasBlockingBooking(unit)) {
      this.formError = 'This fleet unit has an active booking and cannot be deactivated.';
      return;
    }

    this.fleetVehicles = this.fleetVehicles.map(item =>
      Number(item.id) === Number(unit.id)
        ? { ...item, status: 'inactive', isActive: false, updatedAt: new Date().toISOString() }
        : item
    );

    this.persistFleet();
    this.loadData();
    this.formSuccess = 'Fleet unit deactivated.';
  }

  reactivateFleetUnit(unit: AdminFleetVehicle): void {
    this.fleetVehicles = this.fleetVehicles.map(item =>
      Number(item.id) === Number(unit.id)
        ? { ...item, status: 'available', isActive: true, updatedAt: new Date().toISOString() }
        : item
    );

    this.persistFleet();
    this.loadData();
    this.formSuccess = 'Fleet unit reactivated as available.';
  }

  deleteFleetUnit(unit: AdminFleetVehicle): void {
    this.formError = '';
    this.formSuccess = '';

    if (this.hasBlockingBooking(unit)) {
      this.formError = 'This fleet unit has an active booking and cannot be deleted.';
      return;
    }

    if (this.hasAnyBooking(unit)) {
      this.formError = 'This fleet unit has booking history. Deactivate it instead of deleting it.';
      return;
    }

    const confirmed = window.confirm(`Delete fleet unit ${unit.registrationNumber || unit.id} permanently?`);
    if (!confirmed) {
      return;
    }

    this.fleetVehicles = this.fleetVehicles.filter(item => Number(item.id) !== Number(unit.id));
    this.persistFleet();
    this.loadData();
    this.formSuccess = 'Fleet unit deleted.';
  }

  getCatalogueVehicle(unit: AdminFleetVehicle): AdminCatalogueVehicle | undefined {
    const catalogueId = this.getCatalogueId(unit);
    return this.catalogue.find(vehicle => Number(vehicle.id) === catalogueId);
  }

  getActiveBooking(unit: AdminFleetVehicle): AdminBooking | undefined {
    return this.bookings.find(booking =>
      Number(booking.fleetVehicleId || 0) === Number(unit.id)
      && this.isBlockingBooking(booking)
    );
  }

  hasBlockingBooking(unit: AdminFleetVehicle): boolean {
    return this.bookings.some(booking =>
      Number(booking.fleetVehicleId || 0) === Number(unit.id)
      && this.isBlockingBooking(booking)
    );
  }

  hasAnyBooking(unit: AdminFleetVehicle): boolean {
    return this.bookings.some(booking =>
      Number(booking.fleetVehicleId || 0) === Number(unit.id)
      || this.normalise(booking.registrationNumber) === this.normalise(unit.registrationNumber)
    );
  }

  getVehicleDisplayName(vehicle?: AdminCatalogueVehicle): string {
    if (!vehicle) {
      return 'Unknown catalogue vehicle';
    }

    const explicit = vehicle.displayName || vehicle.name;
    if (explicit) {
      return explicit;
    }

    return `${vehicle.make || vehicle.brandName || ''} ${vehicle.model || vehicle.modelName || ''}`.trim() || `Vehicle #${vehicle.id}`;
  }

  getVehicleYear(vehicle?: AdminCatalogueVehicle): number {
    return Number(vehicle?.year || vehicle?.modelYear || new Date().getFullYear());
  }

  getFleetDailyPrice(unit: AdminFleetVehicle): number {
    const vehicle = this.getCatalogueVehicle(unit);
    return Number(vehicle?.dailyPrice || vehicle?.pricePerDay || 0);
  }

  formatFleetDailyPrice(unit: AdminFleetVehicle): string {
    const price = this.getFleetDailyPrice(unit);
    return price > 0 ? `£${price} / day` : 'Price missing';
  }

  getVehicleImage(unit: AdminFleetVehicle): string {
    const vehicle = this.getCatalogueVehicle(unit);
    return vehicle?.imagePath || vehicle?.imageUrl || 'assets/images/car-placeholder.png';
  }

  getColour(unit: AdminFleetVehicle): string {
    return unit.colour || unit.colorName || '';
  }

  getMileage(unit: AdminFleetVehicle): number {
    return Number(unit.mileage || 0);
  }

  getFleetStatus(unit: AdminFleetVehicle): string {
    if (unit.status) {
      return this.normalise(unit.status);
    }

    return unit.isActive === false ? 'inactive' : 'available';
  }

  getLocationId(unit: AdminFleetVehicle): number {
    return Number(unit.locationId || unit.rentalLocationId || 0);
  }

  getCatalogueId(unit: AdminFleetVehicle): number {
    return Number(unit.catalogueItemId || unit.vehicleCatalogueId || unit.vehicleId || 0);
  }

  getLocationName(unit: AdminFleetVehicle): string {
    const locationId = this.getLocationId(unit);
    const location = this.rentalLocations.find(item => Number(item.id) === locationId);
    return unit.locationName || (location ? this.getRentalLocationName(location) : 'No location assigned');
  }

  getRentalLocationName(location: AdminRentalLocation): string {
    return location.name || location.branchName || location.city || `Location #${location.id}`;
  }

  isBlockingBooking(booking: AdminBooking): boolean {
    const status = this.normalise(booking.status || booking.bookingStatus || '');
    return ['pending', 'confirmed', 'paid', 'active'].includes(status);
  }

  private validateFleetForm(): string {
    if (!Number(this.fleetForm.catalogueItemId)) {
      return 'A catalogue vehicle is required.';
    }

    if (!String(this.fleetForm.registrationNumber || '').trim()) {
      return 'Registration number is required.';
    }

    if (this.isDuplicateRegistration()) {
      return 'A fleet unit with this registration number already exists.';
    }

    if (!String(this.fleetForm.colour || '').trim()) {
      return 'Colour is required.';
    }

    if (Number(this.fleetForm.mileage || 0) < 0) {
      return 'Mileage cannot be negative.';
    }

    if (!Number(this.fleetForm.locationId)) {
      return 'Rental location is required.';
    }

    if (!this.fleetForm.status) {
      return 'Status is required.';
    }

    return '';
  }

  private isDuplicateRegistration(): boolean {
    const registration = this.normalise(this.fleetForm.registrationNumber);
    return this.fleetVehicles.some(unit =>
      this.normalise(unit.registrationNumber) === registration
      && Number(unit.id) !== Number(this.fleetForm.id)
    );
  }

  private compareFleetUnits(a: AdminFleetVehicle, b: AdminFleetVehicle): number {
    switch (this.sortBy) {
      case 'vehicle':
        return this.getVehicleDisplayName(this.getCatalogueVehicle(a)).localeCompare(this.getVehicleDisplayName(this.getCatalogueVehicle(b)));
      case 'location':
        return this.getLocationName(a).localeCompare(this.getLocationName(b));
      case 'status':
        return this.getFleetStatus(a).localeCompare(this.getFleetStatus(b));
      case 'mileage':
        return Number(a.mileage || 0) - Number(b.mileage || 0);
      case 'registration':
      default:
        return String(a.registrationNumber || '').localeCompare(String(b.registrationNumber || ''));
    }
  }

  private persistFleet(): void {
    localStorage.setItem(this.fleetStorageKey, JSON.stringify(this.fleetVehicles));
  }

  private createEmptyFleetUnit(): AdminFleetVehicle {
    return {
      id: 0,
      catalogueItemId: this.catalogue[0]?.id || 0,
      vehicleCatalogueId: this.catalogue[0]?.id || 0,
      vehicleId: this.catalogue[0]?.id || 0,
      registrationNumber: '',
      colour: '',
      colorName: '',
      mileage: 0,
      locationId: this.rentalLocations[0]?.id || 0,
      rentalLocationId: this.rentalLocations[0]?.id || 0,
      locationName: this.rentalLocations[0] ? this.getRentalLocationName(this.rentalLocations[0]) : '',
      status: 'available',
      serviceStatus: 'ok',
      nextServiceDue: '',
      isActive: true
    };
  }

  exportFleetCsv(): void {
    const columns: CsvColumn<AdminFleetVehicle>[] = [
      { header: 'Fleet ID', value: (unit) => unit.id },
      { header: 'Registration', value: (unit) => unit.registrationNumber || '' },
      { header: 'Vehicle', value: (unit) => this.getVehicleDisplayName(this.getCatalogueVehicle(unit)) },
      { header: 'Catalogue ID', value: (unit) => unit.catalogueItemId || unit.vehicleCatalogueId || unit.vehicleId || '' },
      { header: 'Colour', value: (unit) => this.getColour(unit) },
      { header: 'Mileage', value: (unit) => unit.mileage || 0 },
      { header: 'Status', value: (unit) => this.getFleetStatus(unit) },
      { header: 'Location', value: (unit) => this.getLocationName(unit) },
      { header: 'Service status', value: (unit) => unit.serviceStatus || '' },
      { header: 'Next service due', value: (unit) => unit.nextServiceDue || '' },
      { header: 'Active booking', value: (unit) => this.getActiveBooking(unit)?.bookingReference || '' },
      { header: 'Active booking customer', value: (unit) => {
          const booking = this.getActiveBooking(unit);
          return booking?.customerName || booking?.name || '';
        } },
      { header: 'Created at', value: (unit) => unit.createdAt || '' },
      { header: 'Updated at', value: (unit) => unit.updatedAt || '' }
    ];
    downloadCsv(timestampedFilename('admin-fleet'), this.filteredFleet, columns);
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

  private normalise(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
  }
}
