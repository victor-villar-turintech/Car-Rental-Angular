import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BookingExtra, BookingExtraCategory, BookingExtraPricingType } from 'src/app/models/booking-extra';
import { BookingExtraService } from 'src/app/services/booking-extra.service';
import { ConfirmDialogService } from 'src/app/services/confirm-dialog.service';

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

  constructor(
    private bookingExtraService: BookingExtraService,
    private toastrService: ToastrService,
    private confirmDialogService: ConfirmDialogService,
  ) {}

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

  async deleteExtra(extra: BookingExtra): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: `Delete ${extra.name}?`,
      message: 'This only affects the local demo extras catalogue. Existing bookings keep their extras snapshot.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) { return; }
    this.bookingExtraService.deleteExtra(extra.extraId).subscribe((response) => {
      this.toastrService.success(response.message);
      this.loadExtras();
    });
  }

  async resetDemoExtras(): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: 'Restore default demo extras?',
      message: 'Custom extras you have added in this browser will be replaced with the original demo set.',
      confirmLabel: 'Restore defaults',
      danger: true,
    });
    if (!confirmed) { return; }
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
