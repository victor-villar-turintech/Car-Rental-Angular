import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DiscountCode, DiscountCodeType } from 'src/app/models/discount-code';
import { DiscountCodeService } from 'src/app/services/discount-code.service';

@Component({ selector: 'app-admin-discounts-dashboard', templateUrl: './discounts-dashboard.component.html', styleUrls: ['./discounts-dashboard.component.css'] })
export class AdminDiscountsDashboardComponent implements OnInit {
  codes: DiscountCode[] = [];
  form: DiscountCode = this.emptyCode();

  constructor(private discountCodeService: DiscountCodeService, private toastrService: ToastrService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.discountCodeService.getCodes().subscribe((response) => this.codes = response.data); }
  edit(code: DiscountCode): void { this.form = { ...code }; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  resetForm(): void { this.form = this.emptyCode(); }
  save(): void { this.discountCodeService.saveCode(this.form).subscribe((response) => { this.toastrService.success(response.message); this.resetForm(); this.load(); }); }
  toggle(code: DiscountCode): void { this.discountCodeService.toggleCode(code.code).subscribe((response) => { this.toastrService.success(response.message); this.load(); }); }
  delete(code: DiscountCode): void { if (!window.confirm(`Delete discount code ${code.code}?`)) { return; } this.discountCodeService.deleteCode(code.code).subscribe((response) => { this.toastrService.success(response.message); this.load(); }); }
  resetDemo(): void { this.discountCodeService.resetDemoCodes(); this.toastrService.success('Demo discount codes reset.'); this.load(); }
  private emptyCode(): DiscountCode { return { code: '', description: '', type: 'Percentage' as DiscountCodeType, value: 10, minimumSpend: 0, usageLimit: 100, usedCount: 0, isActive: true, createdAt: new Date().toISOString() }; }
}
