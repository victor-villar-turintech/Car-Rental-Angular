import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DiscountCode, DiscountValidationResult } from '../models/discount-code';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { ActivityLogService } from './activity-log.service';

@Injectable({ providedIn: 'root' })
export class DiscountCodeService {
  private readonly storageKey = 'rent-a-car-demo-discount-codes';
  private codes: DiscountCode[] = this.loadCodes();

  constructor(private activityLogService: ActivityLogService) {
    if (this.codes.length === 0) {
      this.codes = this.seedCodes();
      this.saveCodes();
    }
  }

  getCodes(): Observable<ListResponseModel<DiscountCode>> {
    return of({ success: true, message: 'Discount codes loaded.', data: this.codes });
  }

  saveCode(code: DiscountCode): Observable<ResponseModel> {
    const normalised = this.normaliseCode(code.code);
    const now = new Date().toISOString();
    const saved: DiscountCode = { ...code, code: normalised, usedCount: Number(code.usedCount || 0), value: Number(code.value || 0), minimumSpend: Number(code.minimumSpend || 0), createdAt: code.createdAt || now, updatedAt: now };
    const exists = this.codes.some((item) => this.normaliseCode(item.code) === normalised);
    this.codes = exists ? this.codes.map((item) => this.normaliseCode(item.code) === normalised ? saved : item) : [saved, ...this.codes];
    this.saveCodes();
    this.activityLogService.record(exists ? 'Discount code updated' : 'Discount code added', 'Admin', `Discount code ${normalised} saved.`, { entityReference: normalised, severity: 'Info' });
    return of({ success: true, message: exists ? 'Discount code updated.' : 'Discount code added.' });
  }

  deleteCode(code: string): Observable<ResponseModel> {
    const normalised = this.normaliseCode(code);
    this.codes = this.codes.filter((item) => this.normaliseCode(item.code) !== normalised);
    this.saveCodes();
    this.activityLogService.record('Discount code deleted', 'Admin', `Discount code ${normalised} deleted.`, { entityReference: normalised, severity: 'Warning' });
    return of({ success: true, message: 'Discount code deleted.' });
  }

  toggleCode(code: string): Observable<ResponseModel> {
    const normalised = this.normaliseCode(code);
    this.codes = this.codes.map((item) => this.normaliseCode(item.code) === normalised ? { ...item, isActive: !item.isActive, updatedAt: new Date().toISOString() } : item);
    this.saveCodes();
    return of({ success: true, message: 'Discount code status updated.' });
  }

  validateCode(code: string, grossTotal: number): DiscountValidationResult {
    const normalised = this.normaliseCode(code);
    const match = this.codes.find((item) => this.normaliseCode(item.code) === normalised);
    if (!match) {
      return { valid: false, message: 'Discount code not found.', discountAmount: 0 };
    }
    if (!match.isActive) {
      return { valid: false, message: 'Discount code is inactive.', discountAmount: 0 };
    }
    if (match.expiryDate && new Date(match.expiryDate) < new Date()) {
      return { valid: false, message: 'Discount code has expired.', discountAmount: 0 };
    }
    if (match.usageLimit && match.usedCount >= match.usageLimit) {
      return { valid: false, message: 'Discount code usage limit reached.', discountAmount: 0 };
    }
    if (match.minimumSpend && grossTotal < match.minimumSpend) {
      return { valid: false, message: `Minimum spend is £${match.minimumSpend}.`, discountAmount: 0 };
    }
    const rawDiscount = match.type === 'Percentage' ? grossTotal * (match.value / 100) : match.value;
    const discountAmount = Math.min(grossTotal, Math.round(rawDiscount * 100) / 100);
    return { valid: true, message: `Applied ${match.code}.`, discountAmount, code: match };
  }

  markCodeUsed(code: string): void {
    const normalised = this.normaliseCode(code);
    this.codes = this.codes.map((item) => this.normaliseCode(item.code) === normalised ? { ...item, usedCount: Number(item.usedCount || 0) + 1, updatedAt: new Date().toISOString() } : item);
    this.saveCodes();
  }

  resetDemoCodes(): void {
    this.codes = this.seedCodes();
    this.saveCodes();
  }

  private seedCodes(): DiscountCode[] {
    const now = new Date().toISOString();
    return [
      { code: 'WELCOME10', description: '10% off first demo booking', type: 'Percentage', value: 10, minimumSpend: 50, usageLimit: 100, usedCount: 0, isActive: true, createdAt: now },
      { code: 'AIRPORT15', description: '£15 off airport pickup rentals', type: 'Fixed', value: 15, minimumSpend: 80, usageLimit: 100, usedCount: 0, isActive: true, createdAt: now },
      { code: 'WEEKEND20', description: '20% off weekend rentals', type: 'Percentage', value: 20, minimumSpend: 120, usageLimit: 50, usedCount: 0, isActive: true, createdAt: now },
      { code: 'LOYALTY25', description: '£25 off returning customer rentals', type: 'Fixed', value: 25, minimumSpend: 150, usageLimit: 25, usedCount: 0, isActive: true, createdAt: now },
    ];
  }

  private loadCodes(): DiscountCode[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) { return []; }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  private saveCodes(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.codes));
  }

  private normaliseCode(value: string): string {
    return (value || '').trim().toUpperCase();
  }
}
