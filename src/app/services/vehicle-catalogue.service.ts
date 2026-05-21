import { Injectable } from '@angular/core';
import { VehicleCatalogueItem } from '../models/vehicle-catalogue-item.model';
import { CatalogueVehicleViewModel } from '../models/catalogue-availability-summary.model';
import { MOCK_VEHICLE_CATALOGUE } from '../data/mock-vehicle-catalogue';
import { MOCK_FLEET_VEHICLES } from '../data/mock-fleet-vehicles';
import { getAvailabilitySummary, toCatalogueVehicleViewModel } from '../helpers/vehicle-adapter';
import { FleetVehicle } from '../models/fleet-vehicle.model';
import { buildVehicleCatalogueFromLegacyData } from '../helpers/legacy-vehicle-migration';

@Injectable({ providedIn: 'root' })
export class VehicleCatalogueService {
  private readonly catalogueKey = 'vehicleCatalogue';
  private readonly fleetKey = 'fleetVehicles';
  private readonly migrationKey = 'catalogueFleetMigrationV1Complete';

  constructor() {
    this.ensureSeedData();
  }

  ensureSeedData(): void {
    if (!localStorage.getItem(this.catalogueKey)) {
      localStorage.setItem(this.catalogueKey, JSON.stringify(MOCK_VEHICLE_CATALOGUE));
    }

    if (!localStorage.getItem(this.fleetKey)) {
      localStorage.setItem(this.fleetKey, JSON.stringify(MOCK_FLEET_VEHICLES));
    }

    if (!localStorage.getItem(this.migrationKey)) {
      localStorage.setItem(this.migrationKey, 'true');
    }
  }

        getCatalogueItems(): VehicleCatalogueItem[] {


          const migrationKey = 'legacyVehicleMigrationV4bComplete';


          const migratedCatalogue = buildVehicleCatalogueFromLegacyData();



          if (!localStorage.getItem(migrationKey) && migratedCatalogue.length > 0) {


            this.saveCatalogueItems(migratedCatalogue);


            localStorage.setItem(migrationKey, 'true');


            return migratedCatalogue;


          }



          const stored = localStorage.getItem(this.catalogueKey);



          if (stored) {


            return JSON.parse(stored);


          }



          const initialCatalogue = migratedCatalogue.length > 0


            ? migratedCatalogue


            : MOCK_VEHICLE_CATALOGUE;



          this.saveCatalogueItems(initialCatalogue);


          localStorage.setItem(migrationKey, 'true');


          return initialCatalogue;


        }

  getActiveCatalogueItems(): VehicleCatalogueItem[] {
    return this.getCatalogueItems().filter(item => item.isActive);
  }

  getCatalogueItemById(id: number): VehicleCatalogueItem | undefined {
    return this.getCatalogueItems().find(item => item.id === id);
  }

  saveCatalogueItems(items: VehicleCatalogueItem[]): void {
    localStorage.setItem(this.catalogueKey, JSON.stringify(items));
  }

  createCatalogueItem(item: VehicleCatalogueItem): void {
    const items = this.getCatalogueItems();
    const nextId = items.length ? Math.max.apply(null, items.map(v => v.id)) + 1 : 1;

    items.push({
      ...item,
      id: item.id || nextId,
      isActive: item.isActive !== false,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.saveCatalogueItems(items);
  }

  updateCatalogueItem(updatedItem: VehicleCatalogueItem): void {
    const items = this.getCatalogueItems().map(item =>
      item.id === updatedItem.id
        ? { ...updatedItem, updatedAt: new Date().toISOString() }
        : item
    );

    this.saveCatalogueItems(items);
  }

  archiveCatalogueItem(id: number): void {
    const items = this.getCatalogueItems().map(item =>
      item.id === id
        ? { ...item, isActive: false, updatedAt: new Date().toISOString() }
        : item
    );

    this.saveCatalogueItems(items);
  }

  getFleetVehicles(): FleetVehicle[] {
    this.ensureSeedData();
    const stored = localStorage.getItem(this.fleetKey);
    return stored ? JSON.parse(stored) : [];
  }

  getAvailabilityForCatalogueItem(catalogueItemId: number) {
    const item = this.getCatalogueItemById(catalogueItemId);

    if (!item) {
      return null;
    }

    return getAvailabilitySummary(item, this.getFleetVehicles());
  }

  getCatalogueWithAvailability(): CatalogueVehicleViewModel[] {
    const fleetVehicles = this.getFleetVehicles();

    return this.getActiveCatalogueItems().map(item =>
      toCatalogueVehicleViewModel(item, fleetVehicles)
    );
  }
}
