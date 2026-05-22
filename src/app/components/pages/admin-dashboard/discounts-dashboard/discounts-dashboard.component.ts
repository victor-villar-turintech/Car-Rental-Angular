import { Component, OnInit } from '@angular/core';
import { restoreDemoCommerceData } from '../../../../helpers/demo-commerce-data-migration';

interface AdminDiscountCode {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  maxRedemptions: number;
  redeemedCount: number;
  startsAt: string;
  expiresAt: string;
  status: 'active' | 'inactive' | 'expired';
  isActive: boolean;
  appliesTo: string;
  [key: string]: any;
}

@Component({
  selector: 'app-admin-discounts-dashboard',
  templateUrl: './discounts-dashboard.component.html',
  styleUrls: ['./discounts-dashboard.component.css']
})
export class AdminDiscountsDashboardComponent implements OnInit {
  readonly storageKeys = [
    'discountCodes',
    'rent-a-car-demo-discount-codes',
    'rentalDiscountCodes',
    'discounts'
  ];

  discountCodes: AdminDiscountCode[] = [];
  searchTerm = '';
  statusFilter = 'all';
  typeFilter = 'all';
  sortBy = 'code';

  isFormOpen = false;
  isEditing = false;
  formError = '';
  formSuccess = '';

  discountForm: AdminDiscountCode = this.createEmptyDiscountCode();

  ngOnInit(): void {
    restoreDemoCommerceData();
    this.loadData();
  }

  loadData(): void {
    this.discountCodes = this.readFirstNonEmpty<AdminDiscountCode>(this.storageKeys);
    this.persistDiscountCodes();
  }

  get filteredDiscountCodes(): AdminDiscountCode[] {
    const term = this.normalise(this.searchTerm);

    return this.discountCodes
      .filter(code => {
        const status = this.getStatus(code);
        const matchesStatus = this.statusFilter === 'all' || status === this.statusFilter;
        const matchesType = this.typeFilter === 'all' || code.discountType === this.typeFilter;
        const haystack = [
          code.id,
          code.code,
          code.description,
          code.discountType,
          code.value,
          code.minSpend,
          code.appliesTo,
          status
        ].join(' ');

        return matchesStatus && matchesType && this.normalise(haystack).includes(term);
      })
      .sort((a, b) => this.compareDiscountCodes(a, b));
  }

  get activeCount(): number {
    return this.discountCodes.filter(code => this.getStatus(code) === 'active').length;
  }

  get inactiveCount(): number {
    return this.discountCodes.filter(code => this.getStatus(code) === 'inactive').length;
  }

  get expiredCount(): number {
    return this.discountCodes.filter(code => this.getStatus(code) === 'expired').length;
  }

  get totalRedemptions(): number {
    return this.discountCodes.reduce((sum, code) => sum + Number(code.redeemedCount || 0), 0);
  }

  startAdd(): void {
    this.isFormOpen = true;
    this.isEditing = false;
    this.formError = '';
    this.formSuccess = '';
    this.discountForm = this.createEmptyDiscountCode();
  }

  startEdit(code: AdminDiscountCode): void {
    this.isFormOpen = true;
    this.isEditing = true;
    this.formError = '';
    this.formSuccess = '';
    this.discountForm = { ...code };
  }

  cancelForm(): void {
    this.isFormOpen = false;
    this.isEditing = false;
    this.formError = '';
    this.formSuccess = '';
    this.discountForm = this.createEmptyDiscountCode();
  }

  saveDiscountCode(): void {
    this.formError = '';
    this.formSuccess = '';

    const validationError = this.validateForm();
    if (validationError) {
      this.formError = validationError;
      return;
    }

    const normalisedCode = this.normaliseCode(this.discountForm.code);
    const nextStatus = this.getFormStatus();

    const form: AdminDiscountCode = {
      ...this.discountForm,
      code: normalisedCode,
      description: this.discountForm.description.trim(),
      discountType: this.discountForm.discountType,
      value: Number(this.discountForm.value),
      minSpend: Number(this.discountForm.minSpend || 0),
      maxRedemptions: Number(this.discountForm.maxRedemptions || 0),
      redeemedCount: Number(this.discountForm.redeemedCount || 0),
      appliesTo: this.discountForm.appliesTo?.trim() || 'All vehicles',
      status: nextStatus,
      isActive: nextStatus === 'active'
    };

    if (this.isEditing) {
      this.discountCodes = this.discountCodes.map(code =>
        Number(code.id) === Number(form.id) ? { ...code, ...form } : code
      );
      this.formSuccess = 'Discount code updated.';
    } else {
      this.discountCodes = [
        ...this.discountCodes,
        {
          ...form,
          id: this.getNextId(this.discountCodes)
        }
      ];
      this.formSuccess = 'Discount code added.';
    }

    this.persistDiscountCodes();
    this.loadData();
    this.cancelForm();
  }

  deactivateDiscountCode(code: AdminDiscountCode): void {
    this.discountCodes = this.discountCodes.map(item =>
      Number(item.id) === Number(code.id)
        ? { ...item, status: 'inactive', isActive: false }
        : item
    );
    this.persistDiscountCodes();
    this.loadData();
    this.formSuccess = 'Discount code deactivated.';
  }

  reactivateDiscountCode(code: AdminDiscountCode): void {
    const status = this.isExpired(code) ? 'expired' : 'active';
    this.discountCodes = this.discountCodes.map(item =>
      Number(item.id) === Number(code.id)
        ? { ...item, status, isActive: status === 'active' }
        : item
    );
    this.persistDiscountCodes();
    this.loadData();
    this.formSuccess = status === 'active' ? 'Discount code reactivated.' : 'Discount code is expired and was not reactivated.';
  }

  deleteDiscountCode(code: AdminDiscountCode): void {
    if (Number(code.redeemedCount || 0) > 0) {
      this.formError = 'This discount code has redemption history. Deactivate it instead of deleting it.';
      return;
    }

    const confirmed = window.confirm(`Delete discount code ${code.code} permanently?`);
    if (!confirmed) {
      return;
    }

    this.discountCodes = this.discountCodes.filter(item => Number(item.id) !== Number(code.id));
    this.persistDiscountCodes();
    this.loadData();
    this.formSuccess = 'Discount code deleted.';
  }

  formatValue(code: AdminDiscountCode): string {
    return code.discountType === 'percentage'
      ? `${Number(code.value || 0)}%`
      : `£${Number(code.value || 0).toFixed(2)}`;
  }

  getStatus(code: AdminDiscountCode): 'active' | 'inactive' | 'expired' {
    if (this.isExpired(code)) {
      return 'expired';
    }

    if (code.status) {
      return code.status;
    }

    return code.isActive === false ? 'inactive' : 'active';
  }

  redemptionLabel(code: AdminDiscountCode): string {
    const used = Number(code.redeemedCount || 0);
    const max = Number(code.maxRedemptions || 0);
    return max > 0 ? `${used} / ${max}` : `${used} / unlimited`;
  }

  private validateForm(): string {
    const code = this.normaliseCode(this.discountForm.code);

    if (!code) {
      return 'Discount code is required.';
    }

    if (!/^[A-Z0-9_-]{3,24}$/.test(code)) {
      return 'Discount code must be 3-24 characters and contain only letters, numbers, hyphens, or underscores.';
    }

    const duplicate = this.discountCodes.some(item =>
      this.normaliseCode(item.code) === code
      && Number(item.id) !== Number(this.discountForm.id)
    );

    if (duplicate) {
      return 'A discount code with this value already exists.';
    }

    if (!this.discountForm.description?.trim()) {
      return 'Description is required.';
    }

    if (!['percentage', 'fixed'].includes(this.discountForm.discountType)) {
      return 'Discount type is required.';
    }

    const value = Number(this.discountForm.value);
    if (!value || value <= 0) {
      return 'Discount value must be greater than zero.';
    }

    if (this.discountForm.discountType === 'percentage' && value > 100) {
      return 'Percentage discount cannot exceed 100%.';
    }

    if (!this.discountForm.startsAt) {
      return 'Start date is required.';
    }

    if (!this.discountForm.expiresAt) {
      return 'Expiry date is required.';
    }

    if (this.discountForm.expiresAt < this.discountForm.startsAt) {
      return 'Expiry date cannot be before start date.';
    }

    return '';
  }

  private getFormStatus(): 'active' | 'inactive' | 'expired' {
    if (this.isExpired(this.discountForm)) {
      return 'expired';
    }

    return this.discountForm.status === 'inactive' || this.discountForm.isActive === false
      ? 'inactive'
      : 'active';
  }

  private isExpired(code: AdminDiscountCode): boolean {
    if (!code.expiresAt) {
      return false;
    }

    const today = new Date().toISOString().slice(0, 10);
    return code.expiresAt < today;
  }

  private compareDiscountCodes(a: AdminDiscountCode, b: AdminDiscountCode): number {
    switch (this.sortBy) {
      case 'value-high':
        return Number(b.value || 0) - Number(a.value || 0);
      case 'expiry':
        return String(a.expiresAt || '').localeCompare(String(b.expiresAt || ''));
      case 'redemptions':
        return Number(b.redeemedCount || 0) - Number(a.redeemedCount || 0);
      case 'status':
        return this.getStatus(a).localeCompare(this.getStatus(b));
      case 'code':
      default:
        return String(a.code || '').localeCompare(String(b.code || ''));
    }
  }

  private persistDiscountCodes(): void {
    this.storageKeys.forEach(key => localStorage.setItem(key, JSON.stringify(this.discountCodes)));
  }

  private readFirstNonEmpty<T>(keys: string[]): T[] {
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) {
          continue;
        }

        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as T[];
        }
      } catch {
        // Ignore malformed demo data.
      }
    }

    return [];
  }

  private createEmptyDiscountCode(): AdminDiscountCode {
    return {
      id: 0,
      code: '',
      description: '',
      discountType: 'percentage',
      value: 10,
      minSpend: 0,
      maxRedemptions: 100,
      redeemedCount: 0,
      startsAt: new Date().toISOString().slice(0, 10),
      expiresAt: '2026-12-31',
      status: 'active',
      isActive: true,
      appliesTo: 'All vehicles'
    };
  }

  private normaliseCode(value: unknown): string {
    return String(value ?? '').trim().toUpperCase();
  }

  private normalise(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private getNextId(items: Array<{ id?: number }>): number {
    return items.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) + 1;
  }
}
