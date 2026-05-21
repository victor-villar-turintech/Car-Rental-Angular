import { Injectable } from '@angular/core';
import { FleetVehicle, FleetVehicleStatus } from '../models/fleet-vehicle.model';
import { MOCK_FLEET_VEHICLES } from '../data/mock-fleet-vehicles';
import { buildFleetVehiclesFromLegacyData, buildVehicleCatalogueFromLegacyData } from '../helpers/legacy-vehicle-migration';
import { MOCK_RENTAL_LOCATIONS } from '../data/mock-rental-locations';

@Injectable({ providedIn: 'root' })
export class FleetService {
  private readonly fleetKey = 'fleetVehicles';

        getFleetVehicles(): FleetVehicle[] {


          const migrationKey = 'legacyFleetMigrationV4bComplete';


          const migratedCatalogue = buildVehicleCatalogueFromLegacyData();


          const migratedFleet = buildFleetVehiclesFromLegacyData(migratedCatalogue);



          if (!localStorage.getItem('rentalLocations')) {


            localStorage.setItem('rentalLocations', JSON.stringify(MOCK_RENTAL_LOCATIONS));


          }



          if (!localStorage.getItem(migrationKey) && migratedFleet.length > 0) {


            this.saveFleetVehicles(migratedFleet);


            localStorage.setItem(migrationKey, 'true');


            return migratedFleet;


          }



          const stored = localStorage.getItem(this.fleetKey);



          if (stored) {


            return JSON.parse(stored);


          }



          const initialFleet = migratedFleet.length > 0


            ? migratedFleet


            : MOCK_FLEET_VEHICLES;



          this.saveFleetVehicles(initialFleet);


          localStorage.setItem(migrationKey, 'true');


          return initialFleet;


        }

  saveFleetVehicles(vehicles: FleetVehicle[]): void {
    localStorage.setItem(this.fleetKey, JSON.stringify(vehicles));
  }

  getFleetVehicleById(id: number): FleetVehicle | undefined {
    return this.getFleetVehicles().find(vehicle => vehicle.id === id);
  }

  getFleetVehiclesByCatalogueItem(catalogueItemId: number): FleetVehicle[] {
    return this.getFleetVehicles().filter(
      vehicle => vehicle.catalogueItemId === catalogueItemId && vehicle.status !== 'retired'
    );
  }

  getAvailableFleetVehiclesByCatalogueItem(catalogueItemId: number): FleetVehicle[] {
    return this.getFleetVehiclesByCatalogueItem(catalogueItemId).filter(
      vehicle => vehicle.status === 'available'
    );
  }

  createFleetVehicle(vehicle: FleetVehicle): void {
    const vehicles = this.getFleetVehicles();
    const nextId = vehicles.length ? Math.max.apply(null, vehicles.map(v => v.id)) + 1 : 1;

    vehicles.push({
      ...vehicle,
      id: vehicle.id || nextId,
      createdAt: vehicle.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.saveFleetVehicles(vehicles);
  }

  updateFleetVehicle(updatedVehicle: FleetVehicle): void {
    const vehicles = this.getFleetVehicles().map(vehicle =>
      vehicle.id === updatedVehicle.id
        ? { ...updatedVehicle, updatedAt: new Date().toISOString() }
        : vehicle
    );

    this.saveFleetVehicles(vehicles);
  }

  updateFleetVehicleStatus(id: number, status: FleetVehicleStatus): void {
    const vehicles = this.getFleetVehicles();
    const target = vehicles.find(vehicle => vehicle.id === id);

    if (!target) {
      return;
    }

    target.status = status;
    target.updatedAt = new Date().toISOString();
    this.saveFleetVehicles(vehicles);
  }
}
