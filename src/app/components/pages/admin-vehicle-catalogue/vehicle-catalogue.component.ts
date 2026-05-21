import { Component, OnInit } from '@angular/core';

import { FleetVehicle } from '../../../models/fleet-vehicle.model';
import { VehicleCatalogueItem } from '../../../models/vehicle-catalogue-item.model';
import { FleetService } from '../../../services/fleet.service';
import { VehicleCatalogueService } from '../../../services/vehicle-catalogue.service';

@Component({
  selector: 'app-admin-vehicle-catalogue',
  templateUrl: './vehicle-catalogue.component.html',
  styleUrls: ['./vehicle-catalogue.component.css']
})
export class VehicleCatalogueComponent implements OnInit {
  catalogueItems: any[] = [];

  imageValidationError = '';
  imagePreview = '';

  newVehicle: Partial<VehicleCatalogueItem> = {
    make: '',
    model: '',
    trim: '',
    year: new Date().getFullYear(),
    bodyType: 'Car',
    category: 'Standard',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    baseDailyPrice: 95,
    description: '',
    isActive: true
  };

  newFleetUnit: Partial<FleetVehicle> = {
    registrationNumber: '',
    colour: '',
    mileage: 0,
    status: 'available',
    currentLocationId: 1
  };

  constructor(
    private vehicleCatalogueService: VehicleCatalogueService,
    private fleetService: FleetService
  ) {}

  ngOnInit(): void {
    this.loadCatalogue();
  }

  loadCatalogue(): void {
    this.catalogueItems = this.vehicleCatalogueService.getCatalogueWithAvailability();
  }

  getDisplayName(vehicle: any): string {
    return `${vehicle.make || ''} ${vehicle.model || ''}${vehicle.trim ? ' ' + vehicle.trim : ''}`.trim();
  }

  getAvailabilityLabel(vehicle: any): string {
    return vehicle.availability?.statusLabel || 'Availability unknown';
  }

  getAvailableCount(vehicle: any): number {
    return vehicle.availability?.availableCount || 0;
  }

  getFleetCount(vehicle: any): number {
    return vehicle.availability?.totalFleetCount || 0;
  }

  onImageSelected(event: Event): void {
    this.imageValidationError = '';
    this.imagePreview = '';

    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.imageValidationError = 'Please upload an image file.';
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        if (image.width !== 1024 || image.height !== 1024) {
          this.imageValidationError = 'Vehicle image must be exactly 1024x1024 pixels.';
          this.imagePreview = '';
          input.value = '';
          return;
        }

        this.imagePreview = String(reader.result || '');
      };

      image.src = String(reader.result || '');
    };

    reader.readAsDataURL(file);
  }

  canAddVehicle(): boolean {
    return !!this.newVehicle.make &&
      !!this.newVehicle.model &&
      !!this.newVehicle.baseDailyPrice &&
      !!this.imagePreview &&
      !this.imageValidationError;
  }

  addVehicle(): void {
    if (!this.canAddVehicle()) {
      this.imageValidationError = this.imageValidationError || 'Complete required vehicle fields and upload a 1024x1024 image.';
      return;
    }

    const catalogueItems = this.vehicleCatalogueService.getCatalogueItems();
    const nextCatalogueId = catalogueItems.length > 0
      ? Math.max(...catalogueItems.map(item => item.id)) + 1
      : 1;

    const vehicle: VehicleCatalogueItem = {
      id: nextCatalogueId,
      make: String(this.newVehicle.make),
      model: String(this.newVehicle.model),
      trim: this.newVehicle.trim,
      year: Number(this.newVehicle.year) || new Date().getFullYear(),
      bodyType: String(this.newVehicle.bodyType || 'Car'),
      category: String(this.newVehicle.category || 'Standard'),
      transmission: String(this.newVehicle.transmission || 'Automatic'),
      fuelType: String(this.newVehicle.fuelType || 'Petrol'),
      seats: Number(this.newVehicle.seats) || 5,
      baseDailyPrice: Number(this.newVehicle.baseDailyPrice) || 95,
      imageUrl: this.imagePreview,
      description: String(this.newVehicle.description || `${this.newVehicle.make} ${this.newVehicle.model} available for rental.`),
      features: [
        String(this.newVehicle.transmission || 'Automatic'),
        String(this.newVehicle.fuelType || 'Petrol'),
        `${Number(this.newVehicle.seats) || 5} seats`
      ],
      badges: [
        String(this.newVehicle.category || 'Standard'),
        String(this.newVehicle.bodyType || 'Car')
      ],
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.vehicleCatalogueService.saveCatalogueItems([...catalogueItems, vehicle]);

    if (this.newFleetUnit.registrationNumber || this.newFleetUnit.colour) {
      const fleetVehicles = this.fleetService.getFleetVehicles();
      const nextFleetId = fleetVehicles.length > 0
        ? Math.max(...fleetVehicles.map(item => item.id)) + 1
        : 1;

      const fleetVehicle: FleetVehicle = {
        id: nextFleetId,
        catalogueItemId: vehicle.id,
        registrationNumber: String(this.newFleetUnit.registrationNumber || `CR${String(nextFleetId).padStart(3, '0')} NEW`),
        colour: String(this.newFleetUnit.colour || 'Unspecified'),
        mileage: Number(this.newFleetUnit.mileage) || 0,
        status: this.newFleetUnit.status || 'available',
        currentLocationId: Number(this.newFleetUnit.currentLocationId) || 1,
        createdAt: new Date().toISOString()
      };

      this.fleetService.saveFleetVehicles([...fleetVehicles, fleetVehicle]);
    }

    this.resetForm();
    this.loadCatalogue();
  }

  resetForm(): void {
    this.newVehicle = {
      make: '',
      model: '',
      trim: '',
      year: new Date().getFullYear(),
      bodyType: 'Car',
      category: 'Standard',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      seats: 5,
      baseDailyPrice: 95,
      description: '',
      isActive: true
    };

    this.newFleetUnit = {
      registrationNumber: '',
      colour: '',
      mileage: 0,
      status: 'available',
      currentLocationId: 1
    };

    this.imagePreview = '';
    this.imageValidationError = '';
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
