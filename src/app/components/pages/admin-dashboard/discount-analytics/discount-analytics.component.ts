import { Component, OnInit } from '@angular/core';

interface DiscountMetric {
  code: string;
  description: string;
  usedCount: number;
  totalDiscount: number;
  revenueAfterDiscount: number;
  active: boolean;
}

@Component({
  selector: 'app-admin-discount-analytics',
  templateUrl: './discount-analytics.component.html',
  styleUrls: ['./discount-analytics.component.css']
})
export class AdminDiscountAnalyticsComponent implements OnInit {
  metrics: DiscountMetric[] = [];
  totalDiscountGiven = 0;
  totalDiscountedRevenue = 0;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const codes = this.readArray<any>('rentacar-discount-codes');
    const payments = [
      ...this.readArray<any>('rentacar-payments'),
      ...this.readArray<any>('rentacar-demo-payments')
    ];

    this.metrics = codes.map((code) => {
      const matching = payments.filter((payment) => this.normalise(payment.discountCode || payment.appliedDiscountCode) === this.normalise(code.code));
      const totalDiscount = matching.reduce((sum, payment) => sum + Number(payment.discountAmount || payment.discountValue || 0), 0);
      const revenueAfterDiscount = matching.reduce((sum, payment) => sum + Number(payment.finalAmount || payment.amount || 0), 0);
      return {
        code: code.code,
        description: code.description || code.name || 'Demo discount code',
        usedCount: Number(code.usedCount || matching.length || 0),
        totalDiscount,
        revenueAfterDiscount,
        active: code.isActive !== false && code.active !== false
      };
    });

    this.totalDiscountGiven = this.metrics.reduce((sum, item) => sum + item.totalDiscount, 0);
    this.totalDiscountedRevenue = this.metrics.reduce((sum, item) => sum + item.revenueAfterDiscount, 0);
  }

  private readArray<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private normalise(value: string): string {
    return String(value || '').trim().toUpperCase();
  }
}
