import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BookingExtra, BookingExtraCategory, BookingExtraPricingType } from 'src/app/models/booking-extra';
import { BookingExtraService } from 'src/app/services/booking-extra.service';

@Component({
  selector: 'app-admin-extras',
  templateUrl: './extras-dashboard.component.html',
  styleUrls: ['./extras-dashboard.component.css'],
})
export class AdminExtrasComponent implements OnInit {
  extras: BookingExtra[] = [];
  editingExtraId: number | undefined;
  form: Partial<BookingExtra> = this.createEmptyForm();
  categories: BookingExtraCategory[] = ['Insurance', 'Driver', 'Equipment', 'Pickup', 'Support', 'Fuel', 'Other'];
  pricingTypes: BookingExtraPricingType[] = ['perDay', 'fixed'];

  constructor(private bookingExtraService: BookingExtraService, private toastrService: ToastrService) {}

  ngOnInit(): void { this.loadExtras(); }

  loadExtras(): void {
    this.bookingExtraService.getAllExtras().subscribe((response) => {
      this.extras = [...response.data].sort((a, b) => a.category.localeCompare(b.category) || a.extraId - b.extraId);
    });
  }

  saveExtra(): void {
    if (!this.isValidForm()) {
      this.toastrService.error('Name, description and a valid price are required.', 'Invalid extra');
      return;
    }

    const payload = {
      ...this.form,
      name: String(this.form.name || '').trim(),
      description: String(this.form.description || '').trim(),
      price: Number(this.form.price || 0),
      pricingType: (this.form.pricingType || 'fixed') as BookingExtraPricingType,
      category: (this.form.category || 'Other') as BookingExtraCategory,
      enabled: this.form.enabled !== false,
    } as BookingExtra;

    const request = this.editingExtraId
      ? this.bookingExtraService.updateExtra({ ...payload, extraId: this.editingExtraId })
      : this.bookingExtraService.addExtra(payload);

    request.subscribe((response) => {
      this.toastrService.success(response.message);
      this.cancelEdit();
      this.loadExtras();
    });
  }

  editExtra(extra: BookingExtra): void {
    this.editingExtraId = extra.extraId;
    this.form = { ...extra };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingExtraId = undefined;
    this.form = this.createEmptyForm();
  }

  toggleExtra(extra: BookingExtra): void {
    this.bookingExtraService.toggleExtra(extra.extraId).subscribe((response) => {
      this.toastrService.success(response.message);
      this.loadExtras();
    });
  }

  deleteExtra(extra: BookingExtra): void {
    if (!window.confirm(`Delete ${extra.name}? This only affects the local demo extras catalogue.`)) {
      return;
    }
    this.bookingExtraService.deleteExtra(extra.extraId).subscribe((response) => {
      this.toastrService.success(response.message);
      this.loadExtras();
    });
  }

  resetDemoExtras(): void {
    if (!window.confirm('Restore the default demo extras? Custom extras will be replaced.')) {
      return;
    }
    this.bookingExtraService.resetDemoExtras().subscribe((response) => {
      this.toastrService.success(response.message);
      this.cancelEdit();
      this.loadExtras();
    });
  }

  getStatusLabel(extra: BookingExtra): string { return extra.enabled === false ? 'Disabled' : 'Enabled'; }

  private isValidForm(): boolean {
    return !!this.form.name && !!this.form.description && Number(this.form.price) >= 0;
  }

  private createEmptyForm(): Partial<BookingExtra> {
    return { name: '', description: '', price: 0, pricingType: 'fixed', category: 'Other', enabled: true };
  }
}
