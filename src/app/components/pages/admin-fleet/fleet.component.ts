import { Component, OnInit } from '@angular/core';

import { MOCK_RENTAL_LOCATIONS } from '../../../data/mock-rental-locations';
import { FleetVehicle, FleetVehicleStatus } from '../../../models/fleet-vehicle.model';
import { RentalLocation } from '../../../models/rental-location.model';
import { VehicleCatalogueItem } from '../../../models/vehicle-catalogue-item.model';
import { FleetService } from '../../../services/fleet.service';
import { VehicleCatalogueService } from '../../../services/vehicle-catalogue.service';

@Component({
  selector: 'app-admin-fleet',
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.css']
})
export class FleetComponent implements OnInit {
  fleetVehicles: FleetVehicle[] = [];
  catalogueItems: VehicleCatalogueItem[] = [];
  rentalLocations: RentalLocation[] = MOCK_RENTAL_LOCATIONS;

  constructor(
    private fleetService: FleetService,
    private vehicleCatalogueService: VehicleCatalogueService
  ) {}

  ngOnInit(): void {
    this.loadFleet();
  }

  loadFleet(): void {
    this.fleetVehicles = this.fleetService.getFleetVehicles();
    this.catalogueItems = this.vehicleCatalogueService.getCatalogueItems();
  }

  getCatalogueItem(fleetVehicle: FleetVehicle): VehicleCatalogueItem | undefined {
    return this.catalogueItems.find(item => item.id === fleetVehicle.catalogueItemId);
  }

  getVehicleDisplayName(fleetVehicle: FleetVehicle): string {
    const catalogueItem = this.getCatalogueItem(fleetVehicle);

    if (!catalogueItem) {
      return 'Unknown vehicle';
    }

    return `${catalogueItem.make} ${catalogueItem.model}${catalogueItem.trim ? ' ' + catalogueItem.trim : ''}`.trim();
  }

  getVehicleImageUrl(fleetVehicle: FleetVehicle): string {
    const catalogueItem = this.getCatalogueItem(fleetVehicle);

    return catalogueItem?.imageUrl || 'assets/images/cars/car-001.png';
  }

  getLocationName(locationId?: number): string {
    const location = this.rentalLocations.find(item => item.id === locationId);

    return location?.name || 'Unassigned';
  }

  updateStatus(fleetVehicle: FleetVehicle, status: FleetVehicleStatus): void {
    this.fleetService.updateFleetVehicleStatus(fleetVehicle.id, status);
    this.loadFleet();
  }


  logout(): void {
    if (typeof localStorage !== 'undefined') {
      [
      'adminAuth',
      'adminLoggedIn',
      'adminLogin',
      'adminSession',
      'adminToken',
      'adminUser',
      'adminUsername',
      'admin_username',
      'isAdmin',
      'isAdminLoggedIn',
      'rent-a-car-demo-admin-session'
      ].forEach((key: string) => localStorage.removeItem(key));

      Object.keys(localStorage)
        .filter((key: string) => key.toLowerCase().includes('admin'))
        .forEach((key: string) => localStorage.removeItem(key));
    }

    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage)
        .filter((key: string) => key.toLowerCase().includes('admin'))
        .forEach((key: string) => sessionStorage.removeItem(key));
    }

    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }

}
